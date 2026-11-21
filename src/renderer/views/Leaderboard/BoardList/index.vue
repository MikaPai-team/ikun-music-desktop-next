<template>
  <ul ref="dom_lists_list" class="scroll" :class="$style.listsContent">
    <li
      v-for="(item, index) in list"
      :key="item.id"
      :class="[
        $style.listsItem,
        { [$style.active]: item.id == boardId },
        { [$style.clicked]: rightClickItemIndex == index },
      ]"
      :aria-label="item.name"
      tabindex="0"
      role="button"
      :aria-pressed="item.id == boardId"
      @keydown.enter.prevent="handleToggleList(item.id)"
      @keydown.space.prevent="handleToggleList(item.id)"
      @click="handleToggleList(item.id)"
      @contextmenu="handleRigthClick($event, index)"
    >
      <span :class="$style.listsLabel">
        <transition name="list-active">
          <svg-icon v-if="item.id == boardId" name="angle-right-solid" :class="$style.activeIcon" />
        </transition>
        {{ item.name }}
      </span>
    </li>
  </ul>
  <base-menu
    v-model="isShowMenu"
    :menus="menus"
    :xy="menuLocation"
    item-name="name"
    @menu-click="handleMenuClick"
  />
</template>

<script setup>
import { watch, shallowReactive, ref } from '@common/utils/vueTools'
import { getBoardsList, setBoard } from '@renderer/store/leaderboard/action'
import { boards } from '@renderer/store/leaderboard/state'
import useMenu from './useMenu'
import { useRouter, useRoute } from '@common/utils/vueRouter'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  boardId: {
    type: [String, undefined],
    default: undefined,
  },
})

const emit = defineEmits(['show-menu'])

const router = useRouter()
const route = useRoute()

const list = shallowReactive([])
const rightClickItemIndex = ref(-1)

const handleToggleList = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      boardId: id,
    },
  })
}

const { menus, menuLocation, isShowMenu, showMenu, menuClick } = useMenu({ emit, list })

const handleRigthClick = (event, index) => {
  rightClickItemIndex.value = index
  showMenu(event, index)
}
const handleMenuClick = (action) => {
  if (rightClickItemIndex.value < 0) return
  let index = rightClickItemIndex.value
  rightClickItemIndex.value = -1
  menuClick(action, index, props.source)
}

watch(
  () => props.source,
  async (source) => {
    // const source = (await getLeaderboardSetting()).source as LX.OnlineSource
    let boardList = boards[source]
    if (boardList == null) setBoard((boardList = await getBoardsList(source)), source)
    list.splice(0, list.length, ...boardList.list)
    if (!props.boardId && boardList.list.length) handleToggleList(boardList.list[0].id)
  },
  {
    immediate: true,
  }
)

defineExpose({ hideMenu: handleMenuClick })
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.listsContent {
  flex: auto;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
}
.listsItem {
  position: relative;
  margin-bottom: 4px;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-font);
  background: transparent;
  cursor: pointer;
  transition: background-color 0.1s ease;
}
.listsItem:hover,
.listsItem.clicked {
  background: var(--color-primary-alpha-900);
}
.listsItem.active {
  border-color: var(--color-primary-alpha-600);
  color: var(--color-font);
  background: var(--color-primary-alpha-900);
  font-weight: 600;
}
.listsItem:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.activeIcon {
  height: 0.9em;
  width: 0.9em;
  vertical-align: -0.05em;
  color: var(--color-primary);
}
.listsLabel {
  display: block;
  padding: 10px 8px;
  font-size: 13px;
  line-height: 1.4;
  .mixin-ellipsis-1();
}
</style>
