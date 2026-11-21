<template>
  <div :class="$style.container">
    <div
      v-show="!props.listInfo.noItemLabel"
      ref="dom_list_ref"
      :class="$style.listContent"
      class="scroll"
    >
      <ul>
        <li
          v-for="item in props.listInfo.list"
          :key="item.id"
          :class="$style.item"
          tabindex="0"
          role="link"
          :aria-label="item.name"
          @keydown.enter.prevent="toDetail(item)"
          @click="toDetail(item)"
        >
          <div :class="$style.image">
            <img :class="$style.img" alt="" loading="lazy" decoding="async" :src="item.img" />
          </div>
          <div :class="$style.desc">
            <h4>{{ item.name }}</h4>
            <div>
              <p :class="$style.author">{{ item.author }}</p>
              <p v-if="item.time" :class="$style.time">{{ item.time }}</p>
              <div :class="$style.songlist_info">
                <span v-if="item.total != null"><svg-icon name="music" />{{ item.total }}</span>
                <span v-if="item.play_count != null"
                  ><svg-icon name="headphones" />{{ item.play_count }}</span
                >
                <span v-if="visibleSource">{{ item.source }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div :class="$style.pagination">
        <material-pagination
          :count="props.listInfo.total"
          :limit="props.listInfo.limit"
          :page="props.listInfo.page"
          @btn-click="togglePage"
        />
      </div>
    </div>
    <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div v-show="props.listInfo.noItemLabel" :class="$style.noitem">
        <p v-text="props.listInfo.noItemLabel" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@common/utils/vueTools'
import type { ListInfo, ListInfoItem } from '@renderer/store/songList/state'
import { useRoute, useRouter } from '@common/utils/vueRouter'

const props = withDefaults(
  defineProps<{
    listInfo: ListInfo
    visibleSource?: boolean
  }>(),
  {
    visibleSource: false,
  }
)

const router = useRouter()
const route = useRoute()

const dom_list_ref = ref<HTMLElement | null>(null)

const emit = defineEmits(['toggle-page'])

const togglePage = (page: number) => {
  emit('toggle-page', page)
}

const toDetail = (info: ListInfoItem) => {
  void router.push({
    path: '/songList/detail',
    query: {
      source: info.source,
      id: info.id,
      picUrl: info.img,
      fromName: route.name as string,
    },
  })
}

defineExpose({
  scrollTo(top: number) {
    dom_list_ref.value?.scrollTo({
      top,
      // behavior: 'smooth',
    })
  },
  getScrollTop() {
    return dom_list_ref.value?.scrollTop ?? 0
  },
})
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.container {
  overflow: hidden;
  height: 100%;
  min-height: 0;
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
}
.listContent {
  position: absolute;
  inset: 0;
  font-size: 14px;
  box-sizing: border-box;
  padding: 4px 18px 0;
  ul {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px 12px;
  }
}
.item {
  min-width: 0;
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-radius: var(--radius-control);
  cursor: pointer;
  transition: background-color 0.1s ease;
  &:hover {
    background: var(--color-primary-alpha-900);
  }
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
.image {
  flex: 0 0 38%;
  aspect-ratio: 1 / 1;
  align-self: flex-start;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-control-fill);
}
.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.desc {
  flex: auto;
  min-width: 0;
  padding: 2px 4px 2px 0;
  h4 {
    color: var(--color-font);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    .mixin-ellipsis-2();
  }
}
.songlist_info {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-font-label);
  svg {
    margin-right: 3px;
  }
}
.author,
.time {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-font-label);
  .mixin-ellipsis-1();
}
.time {
  margin-top: 3px;
}
.pagination {
  text-align: center;
  padding: 14px 0;
}
.noitem {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .mixin-page-empty();
}
@media (max-width: 900px) {
  .listContent ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .listContent {
    padding-left: 12px;
    padding-right: 12px;
  }
}
@media (max-width: 480px) {
  .listContent ul {
    grid-template-columns: minmax(0, 1fr);
  }
  .image {
    flex-basis: 80px;
  }
}
</style>
