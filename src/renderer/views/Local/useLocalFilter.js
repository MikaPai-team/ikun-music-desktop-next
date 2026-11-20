import { computed, ref, shallowRef, watch, onBeforeUnmount } from '@common/utils/vueTools'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { getListMusics, overwriteListMusics } from '@renderer/store/list/action'
import {
  FILTER_TYPES,
  emptyFilters,
  parseLocalFilterState,
  indexLocalMusic,
  filterLocalMusic,
  getFilterOptions,
} from './localFilter'

export default ({ fullListId, viewListId }) => {
  const fullList = shallowRef([])
  const saved = parseLocalFilterState(appSetting['localMusic.filterState'])
  const query = ref(saved.query)
  const appliedQuery = ref(saved.query)
  const filters = ref(saved.filters)
  const index = computed(() => indexLocalMusic(fullList.value))
  const filteredList = computed(() =>
    filterLocalMusic(index.value, filters.value, appliedQuery.value).map((item) => item.music)
  )
  const options = computed(() =>
    Object.fromEntries(
      FILTER_TYPES.map((type) => [
        type,
        getFilterOptions(
          index.value,
          type,
          filterLocalMusic(index.value, filters.value, appliedQuery.value, type)
        ),
      ])
    )
  )
  const total = computed(() => fullList.value.length)
  const resultCount = computed(() => filteredList.value.length)
  const hasFilters = computed(
    () => !!query.value.trim() || FILTER_TYPES.some((type) => filters.value[type].length)
  )
  const isLoading = ref(true)
  const syncError = ref(false)
  let ready = false
  let disposed = false
  let searchTimer
  let revision = 0
  let syncQueue = Promise.resolve()

  // IPC 覆盖串行执行，并跳过过时请求，快速输入/点选不会让旧结果覆盖新结果。
  const syncView = () => {
    const currentRevision = ++revision
    syncQueue = syncQueue
      .catch(() => {})
      .then(async () => {
        if (!ready || disposed || currentRevision !== revision) return
        try {
          await overwriteListMusics({ listId: viewListId, musicInfos: filteredList.value })
          syncError.value = false
        } catch (error) {
          syncError.value = true
          console.error(error)
        }
      })
    return syncQueue
  }

  // 设置合并只接受原始类型；用 JSON 字符串保存，写盘不等待搜索防抖或页面退出。
  watch(
    () => [query.value, filters.value],
    () => {
      updateSetting({
        'localMusic.filterState': JSON.stringify({ query: query.value, filters: filters.value }),
      })
    },
    { flush: 'sync' }
  )
  watch(query, (value) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      appliedQuery.value = value
    }, 180)
  })
  watch(
    filteredList,
    () => {
      if (ready) void syncView()
    },
    { flush: 'sync' }
  )

  const setFilter = (type, keys) => {
    filters.value = { ...filters.value, [type]: [...keys] }
  }
  const clearFilters = () => {
    query.value = ''
    appliedQuery.value = ''
    filters.value = emptyFilters()
  }

  const reloadFull = async () => {
    try {
      // 缓存预热保证首次覆盖也通过已有 myListUpdate 链路刷新表格与播放队列。
      await getListMusics(viewListId)
      const list = await getListMusics(fullListId)
      if (disposed) return list.length
      fullList.value = [...list]
      ready = true
      await syncView()
      return list.length
    } finally {
      isLoading.value = false
    }
  }
  const handleMyListUpdate = (ids) => {
    if (ids.includes(fullListId)) void reloadFull().catch(console.error)
  }
  window.app_event.on('myListUpdate', handleMyListUpdate)
  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(searchTimer)
    window.app_event.off('myListUpdate', handleMyListUpdate)
  })

  return {
    query,
    filters,
    options,
    total,
    resultCount,
    hasFilters,
    isLoading,
    syncError,
    reloadFull,
    setFilter,
    clearFilters,
    retrySync: syncView,
  }
}
