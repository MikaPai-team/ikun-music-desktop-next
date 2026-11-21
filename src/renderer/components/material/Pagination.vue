<template>
  <div v-if="maxPage > 1" :class="$style.pagination">
    <ul>
      <li v-if="page == 1" :class="$style.disabled">
        <span>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xlink="http://www.w3.org/1999/xlink"
            height="100%"
            viewBox="0 0 451.846 451.847"
            space="preserve"
          >
            <use xlink:href="#icon-left" />
          </svg>
        </span>
      </li>
      <li v-else>
        <button type="button" :aria-label="$t('pagination__prev')" @click="handleClick(page - 1)">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xlink="http://www.w3.org/1999/xlink"
            height="100%"
            viewBox="0 0 451.846 451.847"
            space="preserve"
          >
            <use xlink:href="#icon-left" />
          </svg>
        </button>
      </li>
      <li v-if="maxPage > btnLength && page > pageEvg + 1" :class="$style.first">
        <button
          type="button"
          :aria-label="$t('pagination__page', { num: 1 })"
          @click="handleClick(1)"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xlink="http://www.w3.org/1999/xlink"
            height="100%"
            viewBox="0 0 451.846 451.847"
            space="preserve"
          >
            <use xlink:href="#icon-first" />
          </svg>
        </button>
      </li>
      <li v-for="p in pages" :key="p" :class="{ [$style.active]: p == page }">
        <span v-if="p === page" v-text="page" />
        <button
          v-else
          type="button"
          :aria-label="$t('pagination__page', { num: p })"
          @click="handleClick(p)"
          v-text="p"
        />
      </li>
      <li v-if="maxPage > btnLength && maxPage - page > pageEvg" :class="$style.last">
        <button
          type="button"
          :aria-label="$t('pagination__page', { num: maxPage })"
          @click="handleClick(maxPage)"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xlink="http://www.w3.org/1999/xlink"
            height="100%"
            viewBox="0 0 451.846 451.847"
            space="preserve"
          >
            <use xlink:href="#icon-last" />
          </svg>
        </button>
      </li>
      <li v-if="page == maxPage" :class="$style.disabled">
        <span>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xlink="http://www.w3.org/1999/xlink"
            height="100%"
            viewBox="0 0 451.846 451.847"
            space="preserve"
          >
            <use xlink:href="#icon-right" /></svg
        ></span>
      </li>
      <li v-else>
        <button type="button" :aria-label="$t('pagination__next')" @click="handleClick(page + 1)">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xlink="http://www.w3.org/1999/xlink"
            height="100%"
            viewBox="0 0 451.846 451.847"
            space="preserve"
          >
            <use xlink:href="#icon-right" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from '@common/utils/vueTools'

export default {
  props: {
    count: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 10,
    },
    page: {
      type: Number,
      default: 1,
    },
    btnLength: {
      type: Number,
      default: 7,
    },
  },
  emits: ['btn-click'],
  setup(props, { emit }) {
    const maxPage = computed(() => {
      return Math.ceil(props.count / props.limit) || 1
    })
    const pageEvg = computed(() => {
      return Math.floor(props.btnLength / 2)
    })
    const pages = computed(() => {
      if (maxPage.value <= props.btnLength)
        return Array.from({ length: maxPage.value }, (_, i) => i + 1)
      let start =
        props.page - pageEvg.value > 1
          ? maxPage.value - props.page < pageEvg.value + 1
            ? maxPage.value - (props.btnLength - 1)
            : props.page - pageEvg.value
          : 1
      return Array.from({ length: props.btnLength }, (_, i) => start + i)
    })

    const handleClick = (page) => {
      emit('btn-click', page)
    }

    return {
      maxPage,
      pageEvg,
      pages,
      handleClick,
    }
  },
}
</script>

<style lang="less" module>
.pagination {
  display: inline-block;
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  li {
    display: flex;
  }
  span,
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 34px;
    min-height: 34px;
    padding: 6px 10px;
    border: 1px solid var(--color-control-stroke);
    border-radius: var(--radius-control);
    color: var(--color-font);
    background: transparent;
    font-size: 13px;
    line-height: 1.4;
    font-variant-numeric: tabular-nums;
  }
  svg {
    height: 1em;
  }
  button {
    cursor: pointer;
  }
  button:hover {
    background: var(--color-control-fill-hover);
  }
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
.active span {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha-900);
  font-weight: 600;
}
.disabled span {
  opacity: 0.4;
}
</style>
