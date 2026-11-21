<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h2 :class="$style.title">{{ $t('song_list') }}</h2>
      <div :class="$style.actions">
        <base-btn :class="$style.btn" min @click="visibleOpenSongListModal = true">{{
          $t('songlist__import_input_show_btn')
        }}</base-btn>
        <base-selection
          :model-value="source"
          :class="$style.select"
          :list="sourceList"
          item-key="id"
          item-name="name"
          @update:model-value="handleToggleSource"
        />
      </div>
    </div>
    <div :class="$style.filters">
      <tag-list :source="source" :tag-id="tagId" :sort-id="sortId" />
      <sort-tab :source="source" :tag-id="tagId" :sort-id="sortId" />
    </div>
    <list-view :source="source" :tag-id="tagId" :sort-id="sortId" :page="page" />
    <open-list-modal v-model="visibleOpenSongListModal" :source-list="sourceList" />
  </div>
</template>

<script lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { getSongListSetting, setSongListSetting } from '@renderer/utils/data'
import TagList from './components/TagList.vue'
import SortTab from './components/SortTab.vue'
import OpenListModal from './components/OpenListModal.vue'
import ListView from './ListView.vue'
import { sources, listInfo, isVisibleListDetail } from '@renderer/store/songList/state'
import { sourceNames } from '@renderer/store'
import { useRoute, useRouter } from '@common/utils/vueRouter'

const source = ref<LX.OnlineSource>('kw')
const tagId = ref<string>('')
const sortId = ref<string>('')
const page = ref<number>(1)

interface Query {
  source?: string
  tagId?: string
  sortId?: string
  page?: string
}

const verifyQueryParams = async function (
  this: any,
  to: { query: Query; path: string },
  from: any,
  next: (route?: { path: string; query: Query }) => void
) {
  let _source = to.query.source
  let _tagId = to.query.tagId
  let _sortId = to.query.sortId
  let _page: string | undefined = to.query.page

  if (isVisibleListDetail.value) {
    next({ path: '/songList/detail', query: {} })
    return
  } else if (_source == null) {
    if (listInfo.key) {
      _source = listInfo.source
      _tagId = listInfo.tagId
      _sortId = listInfo.sortId
      _page = listInfo.page.toString()
    } else {
      const setting = await getSongListSetting()
      _source = setting.source
      _tagId = setting.tagId
      _sortId = setting.sortId
      _page = '1'
    }

    next({
      path: to.path,
      query: { ...to.query, source: _source, tagId: _tagId, sortId: _sortId, page: _page },
    })
    return
  }
  next()
  source.value = _source as LX.OnlineSource
  tagId.value = _tagId ?? ''
  sortId.value = _sortId ?? ''
  page.value = _page ? parseInt(_page) : 1
  void setSongListSetting({ source: _source, tagId: _tagId, sortId: _sortId })
}

export default {
  components: {
    TagList,
    SortTab,
    ListView,
    OpenListModal,
  },
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const visibleOpenSongListModal = ref(false)

    const sourceList = computed(() => {
      return sources.map((s) => ({ id: s, name: sourceNames.value[s] }))
    })
    const router = useRouter()
    const route = useRoute()
    const handleToggleSource = (id: LX.OnlineSource) => {
      if (id == source.value) return
      void router.replace({
        path: route.path,
        query: {
          source: id,
          tagId: '',
        },
      })
    }

    return {
      source,
      tagId,
      sortId,
      page,
      sourceList,
      handleToggleSource,
      visibleOpenSongListModal,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  min-height: 0;
}
.header {
  .mixin-page-header();
}
.title {
  .mixin-page-title();
  flex: 1;
}
.actions,
.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.filters {
  flex: none;
  padding: 0 18px 12px;
}
.btn {
  min-height: 38px;
  color: var(--color-font);
}
.select {
  flex: none;
  width: 120px;
  font-size: 13px;
  :global(.label-content) {
    height: 38px;
    border: 1px solid var(--color-control-stroke);
    border-radius: var(--radius-control);
    color: var(--color-font);
    background: var(--color-control-fill);
  }
  :global(.selection-list) {
    max-height: min(320px, 50vh);
  }
}
@media (max-width: 700px) {
  .filters {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
