<template>
  <div ref="root" :class="$style.bar" @keydown.esc.stop.prevent="closePanel(true)">
    <div :class="$style.controls">
      <div :class="$style.search">
        <svg :class="$style.searchIcon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <base-input
          ref="songSearch"
          :model-value="query"
          :trim="false"
          :class="$style.searchInput"
          :placeholder="$t('local__search_placeholder')"
          :aria-label="$t('local__search_placeholder')"
          @compositionstart="composing = true"
          @compositionend="finishComposition"
          @update:model-value="updateQuery"
        />
        <button
          v-if="query"
          type="button"
          :class="$style.searchClear"
          :aria-label="$t('local__clear_search')"
          @click="clearSearch"
        >
          ×
        </button>
      </div>
      <div :class="$style.triggers">
        <base-btn
          v-for="type in types"
          :key="type"
          :class="[
            $style.trigger,
            { [$style.active]: filters[type].length || activeType === type },
          ]"
          :aria-expanded="activeType === type"
          aria-controls="local-filter-panel"
          @click="togglePanel(type, $event)"
        >
          {{ $t(`local__${type}`) }}
          <span v-if="filters[type].length" :class="$style.selectedCount">{{
            filters[type].length
          }}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
        </base-btn>
      </div>
      <div
        v-if="activeType"
        id="local-filter-panel"
        :class="$style.panel"
        role="region"
        :aria-label="$t(`local__${activeType}`)"
      >
        <div :class="$style.panelHeader">
          <div>
            <strong>{{ $t(`local__${activeType}`) }}</strong>
            <p>{{ $t('local__filter_hint') }}</p>
          </div>
          <base-btn
            min
            outline
            :disabled="!filters[activeType].length"
            @click="$emit('filter', activeType, [])"
            >{{ $t('local__reset_category') }}</base-btn
          >
          <button
            type="button"
            :class="$style.close"
            :aria-label="$t('local__close_filter')"
            @click="closePanel(true)"
          >
            ×
          </button>
        </div>
        <base-input
          ref="optionSearch"
          v-model="optionQuery"
          :trim="false"
          :class="$style.optionSearch"
          :placeholder="$t('local__search_filter', { type: $t(`local__${activeType}`) })"
          :aria-label="$t('local__search_filter', { type: $t(`local__${activeType}`) })"
        />
        <div
          :class="['scroll', $style.options, { [$style.folderOptions]: activeType === 'folders' }]"
        >
          <button
            v-for="option in visibleOptions"
            :key="option.key"
            type="button"
            :class="[$style.option, { [$style.chosen]: filters[activeType].includes(option.key) }]"
            :aria-pressed="filters[activeType].includes(option.key)"
            :disabled="!option.count && !filters[activeType].includes(option.key)"
            :title="option.name"
            @click="toggleOption(option.key)"
          >
            <span :class="$style.optionText">
              <span :class="$style.optionName">{{ option.name }}</span>
              <span
                v-if="activeType === 'folders' && option.key !== unknownKey"
                :class="$style.folderPath"
                >{{ option.key }}</span
              >
            </span>
            <span :class="$style.optionCount">{{ option.count }}</span>
            <span :class="$style.check" aria-hidden="true">{{
              filters[activeType].includes(option.key) ? '✓' : '+'
            }}</span>
          </button>
          <p v-if="!visibleOptions.length" :class="$style.noOptions">
            {{ $t('local__no_filter_options') }}
          </p>
        </div>
        <base-btn :class="$style.viewResults" @click="closePanel(true)">{{
          $t('local__view_results', { count: resultCount })
        }}</base-btn>
      </div>
    </div>
    <div :class="$style.summary" aria-live="polite">
      <span :class="$style.resultCount">{{
        hasFilters
          ? $t('local__filtered_count', { count: resultCount, total })
          : $t('local__total_count', { count: total })
      }}</span>
      <div v-if="chips.length" :class="$style.chips">
        <button
          v-for="chip in chips"
          :key="`${chip.type}:${chip.key}`"
          type="button"
          :class="$style.chip"
          :title="chip.type === 'folders' ? chip.key : chip.name"
          :aria-label="$t('local__remove_filter', { name: chip.name })"
          @click="removeChip(chip)"
        >
          <span :class="$style.chipType">{{ $t(`local__${chip.type}`) }}</span>
          <span :class="$style.chipName">{{ chip.name }}</span
          ><span aria-hidden="true">×</span>
        </button>
      </div>
      <base-btn v-if="hasFilters" min outline :class="$style.reset" @click="$emit('clear')">{{
        $t('local__clear_filter')
      }}</base-btn>
    </div>
  </div>
</template>

<script>
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from '@common/utils/vueTools'
import { FILTER_TYPES, UNKNOWN_KEY, normalizeSearch } from '../localFilter'

export default {
  name: 'LocalFilterBar',
  props: {
    query: { type: String, required: true },
    filters: { type: Object, required: true },
    options: { type: Object, required: true },
    total: { type: Number, required: true },
    resultCount: { type: Number, required: true },
    hasFilters: { type: Boolean, required: true },
  },
  emits: ['update:query', 'filter', 'clear'],
  setup(props, { emit }) {
    const root = ref(null)
    const songSearch = ref(null)
    const optionSearch = ref(null)
    const activeType = ref('')
    const optionQuery = ref('')
    const composing = ref(false)
    let trigger
    const optionName = (type, key) => {
      if (key === UNKNOWN_KEY) return window.i18n.t(`local__unknown_${type}`)
      if (type === 'folders') return key.split('/').pop() || key
      return type === 'formats' ? key.toUpperCase() : key
    }
    const visibleOptions = computed(() => {
      if (!activeType.value) return []
      const type = activeType.value
      const words = normalizeSearch(optionQuery.value).trim().split(/\s+/).filter(Boolean)
      return props.options[type]
        .map((option) => ({ ...option, name: optionName(type, option.key) }))
        .filter((option) =>
          words.every((word) => normalizeSearch(`${option.name} ${option.key}`).includes(word))
        )
        .sort(
          (a, b) =>
            Number(props.filters[type].includes(b.key)) -
            Number(props.filters[type].includes(a.key))
        )
    })
    const chips = computed(() =>
      FILTER_TYPES.flatMap((type) =>
        props.filters[type].map((key) => ({ type, key, name: optionName(type, key) }))
      )
    )
    const closePanel = (restoreFocus = false) => {
      activeType.value = ''
      optionQuery.value = ''
      if (restoreFocus) trigger?.focus()
    }
    const togglePanel = async (type, event) => {
      if (activeType.value === type) return closePanel()
      trigger = event.currentTarget
      activeType.value = type
      optionQuery.value = ''
      await nextTick()
      optionSearch.value?.focus()
    }
    const toggleOption = (key) => {
      const keys = props.filters[activeType.value]
      emit(
        'filter',
        activeType.value,
        keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]
      )
    }
    const removeChip = ({ type, key }) =>
      emit(
        'filter',
        type,
        props.filters[type].filter((item) => item !== key)
      )
    const updateQuery = (value) => {
      if (!composing.value) emit('update:query', value)
    }
    const finishComposition = (event) => {
      composing.value = false
      emit('update:query', event.target.value)
    }
    const clearSearch = () => {
      emit('update:query', '')
      songSearch.value?.focus()
    }
    const handleOutside = (event) => {
      if (!root.value?.contains(event.target)) closePanel()
    }
    const handleFocusOut = (event) => {
      if (!root.value?.contains(event.relatedTarget)) closePanel()
    }
    onMounted(() => {
      document.addEventListener('pointerdown', handleOutside)
      root.value.addEventListener('focusout', handleFocusOut)
    })
    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', handleOutside)
      root.value?.removeEventListener('focusout', handleFocusOut)
    })
    return {
      root,
      songSearch,
      optionSearch,
      activeType,
      optionQuery,
      composing,
      types: FILTER_TYPES,
      unknownKey: UNKNOWN_KEY,
      visibleOptions,
      chips,
      closePanel,
      togglePanel,
      toggleOption,
      removeChip,
      updateQuery,
      finishComposition,
      clearSearch,
    }
  },
}
</script>

<style lang="less" module>
.bar {
  padding: 0 18px 8px;
  flex: none;
}
.controls {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.search {
  position: relative;
  flex: 1 1 220px;
  min-width: 180px;
}
.searchInput {
  width: 100%;
  height: 38px;
  padding-left: 36px;
  padding-right: 32px;
}
.searchIcon {
  position: absolute;
  z-index: 1;
  left: 12px;
  top: 11px;
  width: 16px;
  height: 16px;
  pointer-events: none;
  fill: none;
  stroke: var(--color-font-label);
  stroke-width: 1.8;
}
.searchClear,
.close {
  border: 0;
  background: transparent;
  color: var(--color-font-label);
  cursor: pointer;
  font-size: 21px;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-control);
}
.searchClear {
  position: absolute;
  right: 4px;
  top: 4px;
}
.triggers {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.trigger {
  gap: 6px;
  min-height: 38px;
  padding: 4px 10px;
  font-size: 13px;
  svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }
}
.active {
  border-color: var(--color-primary);
  color: var(--color-font);
  background: var(--color-primary-alpha-900);
}
.selectedCount {
  font-size: 11px;
  min-width: 16px;
  text-align: center;
  font-weight: 600;
}
.panel {
  position: absolute;
  z-index: 15;
  right: 0;
  top: calc(100% + 8px);
  width: 480px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid var(--color-control-stroke);
  border-radius: 10px;
  background: var(--color-content-background);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
}
.panelHeader {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  > div {
    flex: auto;
  }
  strong {
    color: var(--color-font);
    font-size: 15px;
    font-weight: 600;
  }
  p {
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-font-label);
  }
}
.optionSearch {
  width: 100%;
  margin-bottom: 10px;
  height: 34px;
}
.options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  max-height: min(240px, 28vh);
  overflow-y: auto;
  align-content: start;
}
.viewResults {
  width: 100%;
  margin-top: 12px;
  color: var(--color-button-font);
  border-color: var(--color-primary-alpha-600);
}
.folderOptions {
  grid-template-columns: minmax(0, 1fr);
}
.option {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  padding: 10px 8px;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--color-font);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  &:hover {
    background: var(--color-primary-alpha-900);
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}
.chosen {
  background: var(--color-primary-alpha-900);
  border-color: var(--color-primary-alpha-600);
  color: var(--color-font);
}
.optionText {
  flex: 1;
  min-width: 0;
}
.optionName,
.folderPath {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.folderPath {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-font-label);
}
.optionCount {
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--color-font-label);
}
.check {
  flex: none;
  width: 14px;
  text-align: center;
  color: var(--color-primary);
}
.noOptions {
  grid-column: 1 / -1;
  color: var(--color-font-label);
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
}
.summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 30px;
  padding-top: 10px;
  font-size: 12px;
  color: var(--color-font-label);
}
.resultCount {
  flex: none;
  font-variant-numeric: tabular-nums;
}
.chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 240px;
  padding: 4px 8px;
  border: 1px solid var(--color-primary-alpha-700);
  border-radius: 6px;
  color: var(--color-font);
  background: var(--color-primary-alpha-900);
  font: inherit;
  cursor: pointer;
}
.chipType {
  color: var(--color-font-label);
  flex: none;
}
.chipName {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.reset {
  margin-left: auto;
  color: var(--color-font-label);
}
.bar button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.searchClear:hover,
.close:hover {
  background: var(--color-primary-alpha-900);
  color: var(--color-font);
}
@media (max-width: 700px) {
  .search {
    flex-basis: 100%;
  }
  .panel {
    left: 0;
    right: auto;
  }
  .bar {
    padding-left: 12px;
    padding-right: 12px;
  }
}
@media (max-width: 400px) {
  .options {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
