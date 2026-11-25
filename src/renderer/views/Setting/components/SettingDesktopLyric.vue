<template lang="pug">
dt#desktop_lyric {{ $t('setting__desktop_lyric') }}
dd
  h3 {{ $t('setting__desktop_lyric_behavior') }}
  div(:class="$style.settingGrid")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_enable" :model-value="appSetting['desktopLyric.enable']" :label="$t('setting__desktop_lyric_enable')" @update:model-value="updateSetting({ 'desktopLyric.enable': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_lock" :model-value="appSetting['desktopLyric.isLock']" :label="$t('setting__desktop_lyric_lock')" @update:model-value="updateSetting({ 'desktopLyric.isLock': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_fullscreen_hide" :model-value="appSetting['desktopLyric.fullscreenHide']" :label="$t('setting__desktop_lyric_fullscreen_hide')" @update:model-value="updateSetting({ 'desktopLyric.fullscreenHide': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_pause_hide" :model-value="appSetting['desktopLyric.pauseHide']" :label="$t('setting__desktop_lyric_pause_hide')" @update:model-value="updateSetting({ 'desktopLyric.pauseHide': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_audio_visualization" :model-value="appSetting['desktopLyric.audioVisualization']" :label="$t('setting__desktop_lyric_audio_visualization')" @update:model-value="updateSetting({ 'desktopLyric.audioVisualization': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_delayScroll" :model-value="appSetting['desktopLyric.isDelayScroll']" :label="$t('setting__desktop_lyric_delay_scroll')" @update:model-value="updateSetting({ 'desktopLyric.isDelayScroll': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_alwaysOnTop" :model-value="appSetting['desktopLyric.isAlwaysOnTop']" :label="$t('setting__desktop_lyric_always_on_top')" @update:model-value="updateSetting({ 'desktopLyric.isAlwaysOnTop': $event })")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_showTaskbar" :model-value="appSetting['desktopLyric.isShowTaskbar']" @update:model-value="updateSetting({ 'desktopLyric.isShowTaskbar': $event })")
      span {{ $t('setting__desktop_lyric_show_taskbar') }}
      svg-icon(class="help-icon" name="help-circle-outline" :aria-label="$t('setting__desktop_lyric_show_taskbar_tip')")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_alwaysOnTopLoop" :model-value="appSetting['desktopLyric.isAlwaysOnTopLoop']" @update:model-value="updateSetting({ 'desktopLyric.isAlwaysOnTopLoop': $event })")
      span {{ $t('setting__desktop_lyric_always_on_top_loop') }}
      svg-icon(class="help-icon" name="help-circle-outline" :aria-label="$t('setting__desktop_lyric_always_on_top_loop_tip')")
    base-checkbox(:class="$style.settingToggle" id="setting_desktop_lyric_lockScreen" :model-value="appSetting['desktopLyric.isLockScreen']" :label="$t('setting__desktop_lyric_lock_screen')" @update:model-value="updateSetting({ 'desktopLyric.isLockScreen': $event })")
    base-checkbox(:class="$style.settingToggle" v-if="!isLinux" id="setting_desktop_lyric_hoverHide" :model-value="appSetting['desktopLyric.isHoverHide']" @update:model-value="updateSetting({ 'desktopLyric.isHoverHide': $event })")
      span {{ $t('setting__desktop_lyric_hover_hide') }}
      svg-icon(class="help-icon" name="help-circle-outline" :aria-label="$t('setting__desktop_lyric_hover_hide_tip')")

dd
  h3 {{ $t('setting__desktop_lyric_layout') }}
  h4#desktop_lyric_direction {{ $t('setting__desktop_lyric_direction') }}
  div(:class="$style.optionRow")
    base-checkbox(id="setting_desktop_lyric_direction_horizontal" :model-value="appSetting['desktopLyric.direction']" need value="horizontal" :label="$t('setting__desktop_lyric_direction_horizontal')" @update:model-value="updateSetting({ 'desktopLyric.direction': $event })")
    base-checkbox(id="setting_desktop_lyric_direction_vertical" :model-value="appSetting['desktopLyric.direction']" need value="vertical" :label="$t('setting__desktop_lyric_direction_vertical')" @update:model-value="updateSetting({ 'desktopLyric.direction': $event })")
  h4#desktop_lyric_scroll_align {{ $t('setting__desktop_lyric_scroll_align') }}
  div(:class="$style.optionRow")
    base-checkbox(id="setting_desktop_lyric_scroll_align_top" :model-value="appSetting['desktopLyric.scrollAlign']" need value="top" :label="$t('setting__desktop_lyric_scroll_align_top')" @update:model-value="updateSetting({ 'desktopLyric.scrollAlign': $event })")
    base-checkbox(id="setting_desktop_lyric_scroll_align_center" :model-value="appSetting['desktopLyric.scrollAlign']" need value="center" :label="$t('setting__desktop_lyric_scroll_align_center')" @update:model-value="updateSetting({ 'desktopLyric.scrollAlign': $event })")
  h4#desktop_lyric_align {{ $t('setting__desktop_lyric_align') }}
  div(:class="$style.optionRow")
    base-checkbox(id="setting_desktop_lyric_align_left" :model-value="appSetting['desktopLyric.style.align']" need value="left" :label="$t('setting__desktop_lyric_align_left')" @update:model-value="updateSetting({ 'desktopLyric.style.align': $event })")
    base-checkbox(id="setting_desktop_lyric_align_center" :model-value="appSetting['desktopLyric.style.align']" need value="center" :label="$t('setting__desktop_lyric_align_center')" @update:model-value="updateSetting({ 'desktopLyric.style.align': $event })")
    base-checkbox(id="setting_desktop_lyric_align_right" :model-value="appSetting['desktopLyric.style.align']" need value="right" :label="$t('setting__desktop_lyric_align_right')" @update:model-value="updateSetting({ 'desktopLyric.style.align': $event })")
  div(:class="$style.optionRow")
    base-checkbox(id="setting_desktop_lyric_ellipsis" :model-value="appSetting['desktopLyric.style.ellipsis']" :label="$t('setting__desktop_lyric_ellipsis')" @update:model-value="updateSetting({ 'desktopLyric.style.ellipsis': $event })")
    base-checkbox(id="setting_desktop_lyric_zoom" :model-value="appSetting['desktopLyric.style.isZoomActiveLrc']" :label="$t('desktop_lyric__lrc_active_zoom_on')" @update:model-value="updateSetting({ 'desktopLyric.style.isZoomActiveLrc': $event })")

dd
  h3 {{ $t('setting__desktop_lyric_automatic_color') }}
  div(:class="$style.settingControl")
    base-checkbox(id="setting_desktop_lyric_auto_color" :model-value="appSetting['desktopLyric.autoColor']" :label="$t('setting__desktop_lyric_auto_color')" @update:model-value="updateSetting({ 'desktopLyric.autoColor': $event })")
    p {{ $t('setting__desktop_lyric_auto_color_tip') }}
  div(:class="$style.settingControl" v-if="appSetting['desktopLyric.autoColor']")
    label(:class="$style.intervalLabel" for="setting_desktop_lyric_auto_color_interval")
      span {{ $t('setting__desktop_lyric_auto_color_interval') }}
      span(:class="$style.intervalValue") {{ appSetting['desktopLyric.autoColorInterval'] }} ms
    p {{ $t('setting__desktop_lyric_auto_color_interval_tip') }}
    base-input(
      id="setting_desktop_lyric_auto_color_interval"
      :class="$style.intervalInput"
      :model-value="appSetting['desktopLyric.autoColorInterval']"
      type="number"
      min="500"
      max="30000"
      step="100"
      :aria-label="$t('setting__desktop_lyric_auto_color_interval')"
      @change="changeColorInterval"
    )

dd
  h3#desktop_lyric_font_weight {{ $t('setting__desktop_lyric_font_weight') }}
  div(:class="$style.optionRow")
    base-checkbox(id="setting_setting__desktop_lyric_font_weight_font" :model-value="appSetting['desktopLyric.style.isFontWeightFont']" :label="$t('setting__desktop_lyric_font_weight_font')" @update:model-value="updateSetting({ 'desktopLyric.style.isFontWeightFont': $event })")
    base-checkbox(id="setting_setting__desktop_lyric_font_weight_line" :model-value="appSetting['desktopLyric.style.isFontWeightLine']" :label="$t('setting__desktop_lyric_font_weight_line')" @update:model-value="updateSetting({ 'desktopLyric.style.isFontWeightLine': $event })")
    base-checkbox(id="setting_setting__desktop_lyric_font_weight_extended" :model-value="appSetting['desktopLyric.style.isFontWeightExtended']" :label="$t('setting__desktop_lyric_font_weight_extended')" @update:model-value="updateSetting({ 'desktopLyric.style.isFontWeightExtended': $event })")
  h4#desktop_lyric_color {{ $t('setting__desktop_lyric_color') }}
  div(:class="$style.groupContent")
    div(:class="$style.item")
      div(ref="lyric_unplay_color_ref" :class="$style.color")
      div(:class="$style.label") {{ $t('setting__desktop_lyric_unplay_color') }}
    div(:class="$style.item")
      div(ref="lyric_played_color_ref" :class="$style.color")
      div(:class="$style.label") {{ $t('setting__desktop_lyric_played_color') }}
    div(:class="$style.item")
      div(ref="lyric_shadow_color_ref" :class="$style.color")
      div(:class="$style.label") {{ $t('setting__desktop_lyric_shadow_color') }}
  div(:class="$style.settingControl")
    base-btn(min @click="resetColor") {{ $t('setting__desktop_lyric_color_reset') }}
  h4#desktop_lyric_font {{ $t('setting__desktop_lyric_font') }}
  div(style="--selection-width: 12rem;")
    base-selection(:list="fontList" :model-value="appSetting['desktopLyric.style.font']" item-key="id" item-name="label" @update:model-value="updateSetting({ 'desktopLyric.style.font': $event })")

dd
  h3#desktop_lyric_line_gap {{ $t('setting__desktop_lyric_line_gap', { num: appSetting['desktopLyric.style.lineGap'] }) }}
  div(:class="$style.optionRow")
    base-btn(min @click="changeLineGap(-1)") {{ $t('setting__desktop_lyric_line_gap_dec') }}
    base-btn(min @click="changeLineGap(1)") {{ $t('setting__desktop_lyric_line_gap_add') }}
  h4#desktop_lyric_reset {{ $t('setting__desktop_lyric_reset') }}
  base-btn(min @click="resetWindowSetting") {{ $t('setting__desktop_lyric_reset_window') }}
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from '@common/utils/vueTools'
import { normalizeDesktopLyricColorInterval } from '@common/utils/desktopLyricColor'
import { getSystemFonts } from '@renderer/utils/ipc'
import { isLinux } from '@common/utils'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { useI18n } from '@renderer/plugins/i18n'
import { pickrTools } from '@renderer/utils/pickrTools'

const defaultUnplayColors = [
  'rgba(255, 255, 255, 1)',
  'rgba(255, 236, 144, 1)',
  'rgba(144, 255, 206, 1)',
  'rgba(32, 255, 132, 1)',
  'rgba(255, 226, 32, 1)',
  'rgba(57, 203, 255, 1)',
  'rgba(217, 57, 255, 1)',
  'rgba(255, 57, 71, 1)',
]
const defaultPlayedColors = [
  'rgba(255, 236, 144, 1)',
  'rgba(144, 255, 206, 1)',
  'rgba(32, 255, 132, 1)',
  'rgba(255, 226, 32, 1)',
  'rgba(57, 203, 255, 1)',
  'rgba(7, 197, 86, 1)',
  'rgba(25, 181, 254, 1)',
  'rgba(217, 57, 255, 1)',
  'rgba(255, 57, 71, 1)',
]
const defaultShadowColors = ['rgba(0, 0, 0, 0.15)']

const useLyricColor = () => {
  const lyric_unplay_color_ref = ref(null)
  const lyric_played_color_ref = ref(null)
  const lyric_shadow_color_ref = ref(null)
  let unplayPicker
  let playedPicker
  let shadowPicker

  const initColors = () => {
    if (lyric_unplay_color_ref.value) {
      unplayPicker = pickrTools.create(
        lyric_unplay_color_ref.value,
        appSetting['desktopLyric.style.lyricUnplayColor'],
        defaultUnplayColors,
        (color) => updateSetting({ 'desktopLyric.style.lyricUnplayColor': color })
      )
    }
    if (lyric_played_color_ref.value) {
      playedPicker = pickrTools.create(
        lyric_played_color_ref.value,
        appSetting['desktopLyric.style.lyricPlayedColor'],
        defaultPlayedColors,
        (color) => updateSetting({ 'desktopLyric.style.lyricPlayedColor': color })
      )
    }
    if (lyric_shadow_color_ref.value) {
      shadowPicker = pickrTools.create(
        lyric_shadow_color_ref.value,
        appSetting['desktopLyric.style.lyricShadowColor'],
        defaultShadowColors,
        (color) => updateSetting({ 'desktopLyric.style.lyricShadowColor': color })
      )
    }
  }

  const destroyColors = () => {
    unplayPicker?.destroy()
    playedPicker?.destroy()
    shadowPicker?.destroy()
  }

  const resetColor = () => {
    const defaults = {
      'desktopLyric.style.lyricUnplayColor': 'rgba(255, 255, 255, 1)',
      'desktopLyric.style.lyricPlayedColor': 'rgba(7, 197, 86, 1)',
      'desktopLyric.style.lyricShadowColor': 'rgba(0, 0, 0, 0.18)',
    }
    updateSetting(defaults)
    unplayPicker?.setColor(defaults['desktopLyric.style.lyricUnplayColor'])
    playedPicker?.setColor(defaults['desktopLyric.style.lyricPlayedColor'])
    shadowPicker?.setColor(defaults['desktopLyric.style.lyricShadowColor'])
  }

  onMounted(initColors)
  onBeforeUnmount(destroyColors)

  return {
    lyric_unplay_color_ref,
    lyric_played_color_ref,
    lyric_shadow_color_ref,
    resetColor,
  }
}

export default {
  name: 'SettingDesktopLyric',
  setup() {
    const t = useI18n()
    const changeLineGap = (step) => {
      const gap = appSetting['desktopLyric.style.lineGap'] + step
      updateSetting({ 'desktopLyric.style.lineGap': Math.min(Math.max(gap, 0), 25) })
    }
    const changeColorInterval = (value) => {
      const interval = normalizeDesktopLyricColorInterval(Number(value))
      updateSetting({ 'desktopLyric.autoColorInterval': interval })
    }
    const { lyric_unplay_color_ref, lyric_played_color_ref, lyric_shadow_color_ref, resetColor } =
      useLyricColor()

    const systemFontList = ref([])
    const fontList = computed(() => [
      { id: '', label: t('setting__desktop_lyric_font_default') },
      ...systemFontList.value,
    ])
    void getSystemFonts().then((fonts) => {
      systemFontList.value = fonts.map((font) => ({
        id: font,
        label: font.replace(/(^"|"$)/g, ''),
      }))
    })

    const resetWindowSetting = () => {
      updateSetting({
        'desktopLyric.width': 450,
        'desktopLyric.height': 300,
        'desktopLyric.x': null,
        'desktopLyric.y': null,
      })
    }

    return {
      appSetting,
      updateSetting,
      changeLineGap,
      changeColorInterval,
      lyric_unplay_color_ref,
      lyric_played_color_ref,
      lyric_shadow_color_ref,
      resetColor,
      resetWindowSetting,
      fontList,
      isLinux,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.settingGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 24px;
}

.settingToggle {
  min-width: 0;

  :global(label) {
    align-items: flex-start;
  }

  :global(label > div) {
    margin-top: 2px;
  }
}

.settingControl {
  margin-top: 15px;

  p {
    margin: 5px 0 0 25px;
    color: var(--color-font-label);
    font-size: 12px;
    line-height: 1.5;
  }
}

h4 {
  margin: 16px 0 9px;
  color: var(--color-font);
  font-size: 12px;
  font-weight: 600;
}

.optionRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  margin: 8px 0 14px;
}

.groupContent {
  display: flex;
  flex-flow: row wrap;
  gap: 14px;
}

.item {
  display: flex;
  width: 70px;
  flex-flow: column nowrap;
  align-items: center;
}

.color {
  width: 80%;
  aspect-ratio: 1 / 1;
  background-color: var(--pcr-color);
  border-radius: @radius-border;
  cursor: pointer;
  transition: @transition-fast !important;
  transition-property: background-color, opacity !important;
  box-shadow: 0 0 3px var(--color-primary-light-100-alpha-300);

  &:hover {
    opacity: 0.7;
  }
}

.label {
  .mixin-ellipsis-2();
  padding-top: 9px;
  text-align: center;
  line-height: 1.2;
}

.intervalLabel {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 3px 8px;
  margin-bottom: 8px;
  color: var(--color-font);
  font-size: 12px;
}

.intervalValue {
  color: var(--color-font-label);
  font-variant-numeric: tabular-nums;
}

.intervalInput {
  width: 150px;
}

@media (max-width: 560px) {
  .settingGrid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
}
</style>
