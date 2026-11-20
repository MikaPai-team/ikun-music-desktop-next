<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <div :class="$style.heading">
        <h2>{{ $t('local_songs') }}</h2>
        <span :class="$style.path" :title="directory">{{
          directory || $t('local__no_directory')
        }}</span>
      </div>
      <div :class="$style.buttons">
        <base-btn min :disabled="isScanning" @click="handleSelectDirectory">
          {{ $t('local__select_directory') }}
        </base-btn>
        <base-btn min :disabled="isScanning || !directory" @click="handleScan">
          {{ isScanning ? $t('local__scanning') : $t('local__refresh') }}
        </base-btn>
      </div>
    </div>
    <filter-bar
      v-model:query="query"
      :filters="filters"
      :options="options"
      :total="total"
      :result-count="resultCount"
      :has-filters="hasFilters"
      @filter="setFilter"
      @clear="clearFilters"
    />
    <div v-if="scanError || syncError" :class="$style.error" role="alert">
      <span>{{ $t(scanError ? 'local__scan_error' : 'local__filter_error') }}</span>
      <base-btn min @click="scanError ? handleScan() : retrySync()">{{
        $t('local__retry')
      }}</base-btn>
    </div>
    <div :class="$style.listWrap">
      <music-list :list-id="viewListId" />
      <div v-if="isLoading || isScanning || !resultCount" :class="$style.empty">
        <strong>{{
          $t(
            isLoading || isScanning
              ? 'local__loading'
              : hasFilters
                ? 'local__no_results'
                : 'local__empty_library'
          )
        }}</strong>
        <p>
          {{
            $t(
              isLoading || isScanning
                ? 'local__loading_hint'
                : hasFilters
                  ? 'local__no_results_hint'
                  : 'local__empty_library_hint'
            )
          }}
        </p>
        <base-btn
          v-if="!isLoading && !isScanning"
          @click="hasFilters ? clearFilters() : handleSelectDirectory()"
        >
          {{ $t(hasFilters ? 'local__clear_filter' : 'local__select_directory') }}
        </base-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from '@common/utils/vueTools'
import { LIST_IDS } from '@common/constants'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { overwriteListMusics } from '@renderer/store/list/action'
import { showSelectDialog } from '@renderer/utils/ipc'
import MusicList from '../List/MusicList/index.vue'
import FilterBar from './components/FilterBar.vue'
import useLocalFilter from './useLocalFilter'

// 放在组件外，防止扫描中切换页面后重复扫描
const isScanning = ref(false)

export default {
  name: 'Local',
  components: {
    MusicList,
    FilterBar,
  },
  setup() {
    const listId = LIST_IDS.LOCAL
    const viewListId = LIST_IDS.LOCAL_VIEW
    const directory = computed(() => appSetting['localMusic.directory'])

    const localFilter = useLocalFilter({ fullListId: listId, viewListId })
    const scanError = ref(false)

    const scanDirectory = async (dir) => {
      if (!dir || isScanning.value) return
      isScanning.value = true
      scanError.value = false
      try {
        const filePaths = await window.lx.worker.main.getLocalMusicFiles(dir)
        const musicInfos = await window.lx.worker.main.createLocalMusicInfos(filePaths)
        await overwriteListMusics({ listId, musicInfos })
        await localFilter.reloadFull()
      } catch (err) {
        console.log(err)
        scanError.value = true
      } finally {
        isScanning.value = false
      }
    }

    const handleSelectDirectory = async () => {
      const { canceled, filePaths } = await showSelectDialog({
        title: window.i18n.t('local__select_directory'),
        defaultPath: directory.value || undefined,
        properties: ['openDirectory'],
      })
      if (canceled || !filePaths.length) return
      const dir = filePaths[0]
      if (dir !== directory.value) localFilter.clearFilters()
      updateSetting({ 'localMusic.directory': dir })
      await scanDirectory(dir)
    }

    const handleScan = () => scanDirectory(directory.value)

    onMounted(async () => {
      try {
        const count = await localFilter.reloadFull()
        if (!count && directory.value) void scanDirectory(directory.value)
      } catch (error) {
        console.error(error)
        scanError.value = true
      }
    })

    return {
      viewListId,
      directory,
      isScanning,
      ...localFilter,
      scanError,
      handleSelectDirectory,
      handleScan,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.container {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 14px;
  flex-wrap: wrap;
}

.heading {
  flex: 1;
  min-width: 160px;
  h2 {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-font);
  }
}
.path {
  display: block;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-font-label);
  font-size: 12px;
}

.buttons {
  flex: none;
  display: flex;
  gap: 8px;
}

.listWrap {
  flex: auto;
  min-height: 0;
  min-width: 0;
  position: relative;
}
.empty {
  position: absolute;
  inset: 40px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: var(--color-content-background);
  color: var(--color-font);
  strong {
    font-size: 16px;
    font-weight: 500;
  }
  p {
    margin: 10px 0 18px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-font-label);
  }
}
.error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 18px;
  font-size: 13px;
  color: var(--color-font);
  background: var(--color-primary-alpha-900);
}
@media (max-width: 700px) {
  .header {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
