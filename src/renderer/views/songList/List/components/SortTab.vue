<template>
  <base-tab
    :model-value="sortId"
    :class="$style.tab"
    :list="list"
    item-label="name"
    @change="handleToggle"
  />
</template>

<script setup>
import { watch, shallowReactive } from '@common/utils/vueTools'
import { sortList } from '@renderer/store/songList/state'
import { useRouter, useRoute } from '@common/utils/vueRouter'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  tagId: {
    type: String,
    required: true,
  },
  sortId: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const route = useRoute()

const list = shallowReactive([])

const handleToggle = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      tagId: props.tagId,
      sortId: id,
    },
  })
}
watch(
  () => props.source,
  async (source) => {
    // const source = (await getLeaderboardSetting()).source as LX.OnlineSource
    if (!source) return
    let _list = sortList[source] ?? []
    list.splice(0, list.length, ..._list)
    if (!props.sortId && list.length) handleToggle(list[0].id)
    // console.log(list)
  },
  {
    immediate: true,
  }
)
</script>

<style lang="less" module>
.tab {
  min-width: 0;
}
</style>
