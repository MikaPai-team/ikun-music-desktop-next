<template lang="pug">
dt#basic {{ $t('setting__basic') }}
dd
  div
    .gap-top
      base-checkbox(id="setting_show_animate" :model-value="appSetting['common.isShowAnimation']" :label="$t('setting__basic_show_animation')" @update:model-value="updateSetting({'common.isShowAnimation': $event})")
    .gap-top
      base-checkbox(id="setting_animate" :disabled="!appSetting['common.isShowAnimation']" :model-value="appSetting['common.randomAnimate']" :label="$t('setting__basic_animation')" @update:model-value="updateSetting({'common.randomAnimate': $event})")
    .gap-top
      base-checkbox(id="setting_start_in_fullscreen" :model-value="appSetting['common.startInFullscreen']" :label="$t('setting__basic_start_in_fullscreen')" @update:model-value="updateSetting({'common.startInFullscreen': $event})")
    .gap-top
      base-checkbox(id="setting_to_tray" :model-value="appSetting['tray.enable']" :label="$t('setting__basic_to_tray')" @update:model-value="updateSetting({'tray.enable': $event})")
    .p.gap-top
      base-btn.btn(min @click="isShowPlayTimeoutModal = true") {{ $t('setting__play_timeout')}} {{ timeLabel ? ` (${timeLabel})` : '' }}

dd
  h3#basic_theme {{ $t('setting__basic_theme') }}
  div
    base-checkbox.gap-left(
      v-for="theme in themeModes" :id="`setting_basic_theme_${theme.id}`" :key="theme.id"
      name="setting_basic_theme" need :model-value="themeId" :value="theme.id" :label="theme.label"
      @update:model-value="toggleTheme($event)")
    svg-icon(class="help-icon" name="help-circle-outline" :aria-label="$t('theme_auto_tip')")

dd
  h3#basic_window_size {{ $t('setting__basic_window_size') }}
  div
    base-checkbox.gap-left(
      v-for="item in windowSizeList" :id="`setting_window_size_${item.id}`" :key="item.id"
      name="setting_window_size" need :model-value="appSetting['common.windowSizeId']" :disabled="isFullscreen" :value="item.id" :label="$t('setting__basic_window_size_' + item.name)"
      @update:model-value="updateSetting({'common.windowSizeId': $event})")

dd
  h3#basic_font_size {{ $t('setting__basic_font_size') }}
  div
    //- base-selection.gap-teft(:list="fontSizeList" :model-value="appSetting['common.fontSize']" @update:model-value="updateSetting({'common.fontSize': $event})")
    base-checkbox.gap-left(
      v-for="item in fontSizeList" :id="`setting_basic_font_size_${item.id}`" :key="item.id"
      name="setting_basic_font_size" need :model-value="appSetting['common.fontSize']" :value="item.id"
      :label="item.label" :disabled="isFullscreen" @update:model-value="updateSetting({'common.fontSize': $event})")

dd
  h3#basic_font {{ $t('setting__basic_font') }}
  div(style="--selection-width: 12rem;")
    base-selection.gap-left(:list="fontList" :model-value="fonts[0]" item-key="id" item-name="label" @update:model-value="updateFonts($event, fonts[1])")
    base-selection.gap-left(v-if="fonts[0]" :list="fontList" :model-value="fonts[1]" item-key="id" item-name="label" @update:model-value="updateFonts(fonts[0], $event)")
    //- base-selection.gap-teft(:list="fontList" :model-value="appSetting['common.font']" item-key="id" item-name="label" @update:model-value="updateSetting({'common.font': $event})")

dd
  h3#basic_lang {{ $t('setting__basic_lang') }}
  div
    base-checkbox.gap-left(
      v-for="item in langList" :id="`setting_lang_${item.locale}`" :key="item.locale" name="setting_lang"
      need :model-value="appSetting['common.langId']" :value="item.locale" :label="item.name" @update:model-value="updateSetting({'common.langId': $event})")

dd
  h3#basic_sourcename {{ $t('setting__basic_sourcename') }}
  div
    base-checkbox.gap-left(
      v-for="item in sourceNameTypes" :id="`setting_abasic_sourcename_${item.id}`" :key="item.id"
      name="setting_basic_sourcename" need :model-value="appSetting['common.sourceNameType']" :value="item.id" :label="item.label" @update:model-value="updateSetting({'common.sourceNameType': $event})")
dd
  h3#basic_control_btn_position {{ $t('setting__basic_control_btn_position') }}
  div
    base-checkbox.gap-left(
      v-for="item in controlBtnPositionList" :id="`setting_basic_control_btn_position_${item.id}`" :key="item.id"
      name="setting_basic_control_btn_position" need :model-value="appSetting['common.controlBtnPosition']" :value="item.id" :label="item.name" @update:model-value="updateSetting({'common.controlBtnPosition': $event})")
dd
  h3#basic_playbar_progress_style {{ $t('setting__basic_playbar_progress_style') }}
  div
    base-checkbox.gap-left(
      id="setting_basic_playbar_progress_style_mini" name="setting_basic_playbar_progress_style"
      need :model-value="appSetting['common.playBarProgressStyle']" value="mini" :label="$t('setting__basic_playbar_progress_style_mini')" @update:model-value="updateSetting({'common.playBarProgressStyle': $event})")
    base-checkbox.gap-left(
      id="setting_basic_playbar_progress_style_middle" name="setting_basic_playbar_progress_style"
      need :model-value="appSetting['common.playBarProgressStyle']" value="middle" :label="$t('setting__basic_playbar_progress_style_middle')" @update:model-value="updateSetting({'common.playBarProgressStyle': $event})")
    base-checkbox.gap-left(
      id="setting_basic_playbar_progress_style_full" name="setting_basic_playbar_progress_style"
      need :model-value="appSetting['common.playBarProgressStyle']" value="full" :label="$t('setting__basic_playbar_progress_style_full')" @update:model-value="updateSetting({'common.playBarProgressStyle': $event})")

play-timeout-modal(v-model="isShowPlayTimeoutModal")
</template>

<script>
import { computed, ref } from '@common/utils/vueTools'
import { windowSizeList, isFullscreen, themeId } from '@renderer/store'
import { langList, useI18n } from '@root/lang'
import { getSystemFonts } from '@renderer/utils/ipc'
import { useTimeout } from '@renderer/core/player/timeoutStop'

import PlayTimeoutModal from './PlayTimeoutModal.vue'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { getThemes, applyTheme, findTheme } from '@renderer/store/utils'

export default {
  name: 'SettingBasic',
  components: {
    PlayTimeoutModal,
  },
  setup() {
    const t = useI18n()

    const themeModes = computed(() => [
      { id: 'fluent_light', label: t('setting__basic_theme_light') },
      { id: 'fluent_dark', label: t('setting__basic_theme_dark') },
      { id: 'auto', label: t('theme_auto') },
    ])
    let dataPath = ''
    const toggleTheme = (id) => {
      themeId.value = id
      applyTheme(id, 'fluent_light', 'fluent_dark', dataPath)
      updateSetting({
        'theme.id': id,
        'theme.lightId': 'fluent_light',
        'theme.darkId': 'fluent_dark',
      })
    }
    getThemes((info) => {
      dataPath = info.dataPath
      const id = themeId.value == 'auto'
        ? 'auto'
        : findTheme(info, themeId.value)?.isDark ? 'fluent_dark' : 'fluent_light'
      if (themeId.value != id || appSetting['theme.lightId'] != 'fluent_light' || appSetting['theme.darkId'] != 'fluent_dark') toggleTheme(id)
    })

    const isShowPlayTimeoutModal = ref(false)
    const { timeLabel } = useTimeout()

    const sourceNameTypes = computed(() => {
      return [
        { id: 'real', label: t('setting__basic_sourcename_real') },
        { id: 'alias', label: t('setting__basic_sourcename_alias') },
      ]
    })

    const controlBtnPositionList = computed(() => {
      return [
        { id: 'left', name: t('setting__basic_control_btn_position_left') },
        { id: 'right', name: t('setting__basic_control_btn_position_right') },
      ]
    })

    const systemFontList = ref([])
    const fontList = computed(() => {
      return [{ id: '', label: t('setting__desktop_lyric_font_default') }, ...systemFontList.value]
    })
    void getSystemFonts().then((fonts) => {
      systemFontList.value = fonts.map((f) => ({ id: f, label: f.replace(/(^"|"$)/g, '') }))
    })

    const fonts = computed(() => {
      if (!appSetting['common.font']) return ['', '']
      let [f1 = '', f2 = ''] = appSetting['common.font'].split(',')
      return [f1.trim(), f2.trim()]
    })
    const updateFonts = (font1, font2) => {
      let font = []
      if (font1) font.push(font1)
      if (font2) font.push(font2)
      updateSetting({ 'common.font': font.join(', ') })
    }
    const fontSizeList = computed(() => {
      return [
        { id: 14, label: t('setting__basic_font_size_14px') },
        { id: 15, label: t('setting__basic_font_size_15px') },
        { id: 16, label: t('setting__basic_font_size_16px') },
        { id: 17, label: t('setting__basic_font_size_17px') },
        { id: 18, label: t('setting__basic_font_size_18px') },
        { id: 19, label: t('setting__basic_font_size_19px') },
      ]
    })

    return {
      themeModes,
      appSetting,
      updateSetting,
      fonts,
      updateFonts,
      isShowPlayTimeoutModal,
      timeLabel,
      windowSizeList,
      langList,
      sourceNameTypes,
      controlBtnPositionList,
      fontList,
      isFullscreen,
      toggleTheme,
      themeId,
      fontSizeList,
    }
  },
}
</script>
