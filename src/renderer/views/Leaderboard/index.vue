<template>
  <div :class="$style.leaderboard">
    <div :class="$style.header">
      <h2 :class="$style.title">{{ $t('leaderboard') }}</h2>
      <base-selection
        :model-value="source"
        :class="$style.select"
        :list="sourceList"
        item-key="id"
        item-name="name"
        @update:model-value="handleToggleSource"
      />
    </div>
    <div :class="$style.content">
      <div :class="$style.lists">
        <BoardList
          ref="boardListRef"
          :board-id="boardId"
          :source="source"
          @show-menu="$refs.musicListRef?.hideMenu()"
        />
      </div>
      <div :class="$style.list">
        <MusicList
          ref="musicListRef"
          :source="source"
          :board-id="boardId"
          @show-menu="$refs.boardListRef?.hideMenu()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from '@common/utils/vueTools'
import { getLeaderboardSetting, setLeaderboardSetting } from '@renderer/utils/data'
import BoardList from './BoardList/index.vue'
import MusicList from './MusicList/index.vue'
import { sources } from '@renderer/store/leaderboard/state'
import { sourceNames } from '@renderer/store'
import { useRoute, useRouter } from '@common/utils/vueRouter'

const source = ref('')
const boardId = ref(null)

const verifyQueryParams = async function (to, from, next) {
  let _source = to.query.source
  let _boardId = to.query.boardId

  if (_source == null) {
    const setting = await getLeaderboardSetting()
    if (_source == null) {
      _source = setting.source
      _boardId = setting.boardId
    }
    next({
      path: to.path,
      query: { ...to.query, source: _source, boardId: _boardId },
    })
    return
  }
  next()
  source.value = _source
  boardId.value = _boardId
  void setLeaderboardSetting({ source: _source, boardId: _boardId })
}

export default {
  components: {
    BoardList,
    MusicList,
  },
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const musicListRef = ref(null)
    const boardListRef = ref(null)
    const sourceList = computed(() => {
      return sources.map((s) => ({ id: s, name: sourceNames.value[s] }))
    })
    const router = useRouter()
    const route = useRoute()
    const handleToggleSource = (id) => {
      void router.replace({
        path: route.path,
        query: {
          source: id,
        },
      })
    }

    return {
      source,
      boardId,
      sourceList,
      handleToggleSource,
      musicListRef,
      boardListRef,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.leaderboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.header {
  .mixin-page-header();
}
.title {
  .mixin-page-title();
  flex: 1;
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
.content {
  flex: auto;
  min-height: 0;
  display: flex;
  gap: 12px;
  padding: 0 18px;
}
.lists {
  flex: 0 0 160px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-divider);
  padding-right: 10px;
}
.list {
  position: relative;
  overflow: hidden;
  min-width: 0;
  flex: auto;
}
@media (max-width: 700px) {
  .content {
    padding: 0 12px;
    gap: 8px;
  }
  .lists {
    flex-basis: 120px;
    padding-right: 6px;
  }
}
</style>
