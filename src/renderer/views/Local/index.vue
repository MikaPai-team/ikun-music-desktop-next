<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <span :class="$style.path" :aria-label="directory">
        {{ directory || $t('local__no_directory') }}
      </span>
      <div :class="$style.buttons">
        <base-btn min @click="handleSelectDirectory">
          {{ $t('local__select_directory') }}
        </base-btn>
        <base-btn min :disabled="isScanning || !directory" @click="handleScan">
          {{ isScanning ? $t('local__scanning') : $t('local__refresh') }}
        </base-btn>
      </div>
    </div>
    <div :class="$style.main">
      <music-list :list-id="listId" />
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from '@common/utils/vueTools'
import { LIST_IDS } from '@common/constants'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { getListMusics, overwriteListMusics } from '@renderer/store/list/action'
import { showSelectDialog } from '@renderer/utils/ipc'
import MusicList from '../List/MusicList/index.vue'

// 放在组件外，防止扫描中切换页面后重复扫描
const isScanning = ref(false)

export default {
  name: 'Local',
  components: {
    MusicList,
  },
  setup() {
    const listId = LIST_IDS.LOCAL
    const directory = computed(() => appSetting['localMusic.directory'])

    const scanDirectory = async (dir) => {
      if (!dir || isScanning.value) return
      isScanning.value = true
      try {
        const filePaths = await window.lx.worker.main.getLocalMusicFiles(dir)
        const musicInfos = await window.lx.worker.main.createLocalMusicInfos(filePaths)
        await overwriteListMusics({ listId, musicInfos })
      } catch (err) {
        console.log(err)
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
      updateSetting({ 'localMusic.directory': dir })
      await scanDirectory(dir)
    }

    const handleScan = () => scanDirectory(directory.value)

    onMounted(async () => {
      const list = await getListMusics(listId)
      if (!list.length && directory.value) void scanDirectory(directory.value)
    })

    return {
      listId,
      directory,
      isScanning,
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
  padding: 10px 15px;
}

.path {
  flex: auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-font-label);
  font-size: 14px;
}

.buttons {
  flex: none;
  display: flex;
  gap: 8px;
}

.main {
  flex: auto;
  min-height: 0;
  position: relative;
}
</style>
