<template>
  <ul :class="[$style.list, $style[align]]" role="tablist">
    <li
      v-for="item in list"
      :key="item[itemKey]"
      :class="[$style.listItem, { [$style.active]: modelValue == item[itemKey] }]"
      role="presentation"
    >
      <button
        type="button"
        :class="$style.label"
        role="tab"
        :aria-label="item[itemLabel]"
        :aria-selected="modelValue == item[itemKey]"
        ignore-tip
        @click="handleToggle(item[itemKey])"
      >
        {{ item[itemLabel] }}
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },
    align: {
      type: String,
      default: 'left',
    },
    itemKey: {
      type: String,
      default: 'id',
    },
    itemLabel: {
      type: String,
      default: 'label',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleToggle = (id) => {
      if (id == props.modelValue) return
      emit('update:modelValue', id)
      emit('change', id)
    }

    return {
      handleToggle,
    }
  },
}
</script>

<style lang="less" module>
.list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 0;
  font-size: 13px;
}
.left {
  justify-content: flex-start;
}
.center {
  justify-content: center;
}
.right {
  justify-content: flex-end;
}
.listItem {
  display: block;
}
.label {
  display: block;
  box-sizing: border-box;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--color-control-stroke);
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--color-font-label);
  font: inherit;
  line-height: 1.4;
  cursor: pointer;
  transition:
    background-color 0.1s ease,
    border-color 0.1s ease;
}
.label:hover {
  background: var(--color-control-fill-hover);
  color: var(--color-font);
}
.label:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.active .label {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha-900);
  color: var(--color-font);
  font-weight: 600;
}
</style>
