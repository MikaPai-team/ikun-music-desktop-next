<template>
  <div
    :class="[$style.tagList, { [$style.active]: popupVisible }]"
    @keydown.esc.stop.prevent="
      () => {
        handleHide()
        dom_btn?.focus()
      }
    "
  >
    <button
      ref="dom_btn"
      type="button"
      :class="$style.label"
      :aria-expanded="popupVisible"
      @click.stop="handleShow"
    >
      <span>{{ tagName }}</span>
      <div :class="$style.icon">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xlink="http://www.w3.org/1999/xlink"
          height="100%"
          viewBox="0 0 451.847 451.847"
          space="preserve"
        >
          <use xlink:href="#icon-down" />
        </svg>
      </div>
    </button>
    <div :class="$style.popup" :style="popupStyle" :aria-hidden="!popupVisible" @click.stop>
      <div :class="$style.list" class="scroll">
        <button
          type="button"
          :class="[$style.tag, { [$style.chosen]: !props.tagId }]"
          :aria-pressed="!props.tagId"
          @click="handleToggleTag('')"
        >
          {{ $t('default') }}
        </button>
        <dl v-for="tagInfo in list" :key="tagInfo.name">
          <dt :class="$style.type">{{ tagInfo.name }}</dt>
          <dd v-for="tag in tagInfo.list" :key="tag.id">
            <button
              type="button"
              :class="[$style.tag, { [$style.chosen]: tag.id == props.tagId }]"
              :aria-pressed="tag.id == props.tagId"
              @click="handleToggleTag(tag.id)"
            >
              {{ tag.name }}
            </button>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  watch,
  shallowReactive,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  reactive,
} from '@common/utils/vueTools'
import { setTags, getTags } from '@renderer/store/songList/action'
import { tags } from '@renderer/store/songList/state'
import { useRouter, useRoute } from '@common/utils/vueRouter'
import { useI18n } from '@renderer/plugins/i18n'

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
    type: [String, undefined],
    default: undefined,
  },
})

const router = useRouter()
const route = useRoute()
const t = useI18n()

const list = shallowReactive([])
const handleToggleTag = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      tagId: id,
      sortId: props.sortId,
    },
  })
  handleHide()
}
watch(
  () => props.source,
  async (source) => {
    if (!source) return
    // const source = (await getLeaderboardSetting()).source as LX.OnlineSource
    let tagInfo = tags[source]
    // console.log(await getTags(source))
    if (tagInfo == null) setTags((tagInfo = await getTags(source)), source)

    list.splice(
      0,
      list.length,
      ...[
        { name: window.i18n.t('songlist__tag_info_hot_tag'), list: [...tagInfo.hotTag] },
        ...tagInfo.tags,
      ]
    )
  },
  {
    immediate: true,
  }
)
const tagName = computed(() => {
  if (!props.tagId) return t('default')
  for (const tags of list) {
    const tag = tags.list.find((t) => t.id == props.tagId)
    if (tag) return tag.name
  }
  return props.tagId
})

const popupStyle = reactive({
  width: '645px',
  maxHeight: '250px',
})

const setTagPopupWidth = () => {
  window.setTimeout(() => {
    const dom_view = document.getElementById('view')
    popupStyle.width = dom_view.clientWidth * 0.96 + 'px'
    popupStyle.maxHeight = dom_view.clientHeight * 0.65 + 'px'
  }, 50)
}

const dom_btn = ref(null)
const popupVisible = ref(false)
const handleShow = () => (popupVisible.value = !popupVisible.value)
const handleHide = (evt) => {
  // if (e && e.target.parentNode != this.$refs.dom_popup && this.show) return this.show = false
  // console.log(this.$refs)
  if (evt && (evt.target == dom_btn.value || dom_btn.value?.contains(evt.target))) return
  popupVisible.value = false
}

onMounted(() => {
  setTagPopupWidth()
  document.addEventListener('click', handleHide)
  window.addEventListener('resize', setTagPopupWidth)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleHide)
  window.removeEventListener('resize', setTagPopupWidth)
})
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.tagList {
  font-size: 13px;
  position: relative;
}
.label {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--color-control-stroke);
  border-radius: var(--radius-control);
  color: var(--color-font);
  background: var(--color-control-fill);
  font: inherit;
  cursor: pointer;
  span {
    flex: auto;
  }
  &:hover {
    background: var(--color-control-fill-hover);
  }
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
.icon {
  flex: none;
  margin-left: 7px;
  line-height: 0;
  svg {
    width: 0.8em;
    transition: transform 0.2s ease;
  }
}
.active {
  .label {
    border-color: var(--color-primary);
    background: var(--color-primary-alpha-900);
  }
  .icon svg {
    transform: rotate(180deg);
  }
  .popup {
    opacity: 1;
    transform: scale(1);
    visibility: visible;
    pointer-events: auto;
  }
}
.popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  max-width: calc(100vw - 100px);
  box-sizing: border-box;
  border: 1px solid var(--color-control-stroke);
  border-radius: 10px;
  background: var(--color-content-background);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
  opacity: 0;
  visibility: hidden;
  transform: scale(0.98);
  transform-origin: top left;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  z-index: 15;
  pointer-events: none;
  display: flex;
}
.list {
  flex: auto;
  min-width: 0;
  padding: 14px;
  box-sizing: border-box;
  overflow-y: auto;
}
.type {
  padding: 10px 4px 4px;
  color: var(--color-font-label);
  font-size: 12px;
}
.tag {
  display: inline-block;
  margin: 4px;
  border: 1px solid var(--color-control-stroke);
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--color-font);
  font: inherit;
  padding: 8px 10px;
  cursor: pointer;
  &:hover {
    background: var(--color-primary-alpha-900);
  }
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
.chosen {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha-900);
}
.list dd {
  display: inline-block;
}
@media (prefers-reduced-motion: reduce) {
  .popup,
  .icon svg {
    transition: none;
  }
}
</style>
