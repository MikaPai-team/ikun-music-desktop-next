<template>
  <dt>Last.fm</dt>
  <dd>
    <base-checkbox
      id="setting_lastfm_enabled"
      :model-value="appSetting['lastfm.enabled']"
      :label="$t('lastfm__enabled')"
      @update:model-value="updateSetting({ 'lastfm.enabled': $event })"
    />
    <p class="p small">{{ $t('lastfm__rules') }}</p>
    <p v-if="lastfm.authorized" class="p">
      {{ $t('lastfm__connected', { name: lastfm.username }) }}
    </p>
    <div v-if="!lastfm.authorized" :class="$style.fields">
      <label>
        <span>API Key</span>
        <base-input v-model="apiKey" :disabled="busy" autocomplete="off" />
      </label>
      <label>
        <span>Shared Secret</span>
        <base-input v-model="apiSecret" type="password" :disabled="busy" autocomplete="off" />
      </label>
      <p class="p small">{{ $t('lastfm__credentials_tip') }}</p>
    </div>
    <div class="p" :class="$style.actions">
      <base-btn
        v-if="!lastfm.authorized"
        min
        :disabled="busy || !apiKey || !apiSecret"
        @click="authorize"
      >
        {{ $t('lastfm__authorize') }}
      </base-btn>
      <base-btn v-if="lastfm.authorizing" min :disabled="busy" @click="complete">
        {{ $t('lastfm__complete') }}
      </base-btn>
      <base-btn v-if="lastfm.authorized" min :disabled="busy" @click="disconnect">
        {{ $t('lastfm__disconnect') }}
      </base-btn>
      <base-btn min :disabled="busy" @click="refresh">{{ $t('lastfm__refresh') }}</base-btn>
      <base-btn min @click="openUrl('https://www.last.fm/api/account/create')">
        {{ $t('lastfm__get_keys') }}
      </base-btn>
    </div>
    <p v-if="lastfm.authorizing" class="p small">{{ $t('lastfm__authorization_tip') }}</p>
    <p class="p small">{{ $t('lastfm__pending', { count: lastfm.pending }) }}</p>
    <p v-if="errorMessage" class="p small" role="status">{{ errorMessage }}</p>
    <p v-if="lastfm.authorized" class="p small">{{ $t('lastfm__disconnect_tip') }}</p>
  </dd>
</template>

<script>
import { computed, ref } from '@common/utils/vueTools'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { lastfm, lastfmRequest } from '@renderer/store/lastfm'
import { openUrl } from '@common/utils/electron'
import { useI18n } from '@renderer/plugins/i18n'

export default {
  name: 'SettingLastfm',
  setup() {
    const t = useI18n()
    const apiKey = ref('')
    const apiSecret = ref('')
    const busy = ref(false)
    const errorMessage = computed(() => {
      if (!lastfm.error) return ''
      if (lastfm.error.startsWith('api_')) {
        const code = lastfm.error.slice(4)
        if (code == '9') return t('lastfm__error_session')
        if (code == '14') return t('lastfm__authorization_tip')
        return t('lastfm__error_api', { code })
      }
      const keys = {
        network: 'lastfm__error_network',
        response: 'lastfm__error_response',
        storage: 'lastfm__error_storage',
        keys: 'lastfm__error_keys',
        authorize: 'lastfm__error_authorize',
        cancelled: 'lastfm__error_cancelled',
        invalid: 'lastfm__error_invalid',
        ignored: 'lastfm__error_ignored',
        metadata: 'lastfm__error_metadata',
      }
      return t(keys[lastfm.error] ?? 'lastfm__error_response')
    })
    const run = async (action) => {
      busy.value = true
      try {
        return await lastfmRequest(action)
      } finally {
        busy.value = false
      }
    }
    const authorize = async () => {
      if (await run({ action: 'authorize', apiKey: apiKey.value, apiSecret: apiSecret.value })) {
        apiSecret.value = ''
      }
    }
    const complete = async () => {
      if (await run({ action: 'complete' })) {
        apiKey.value = ''
        apiSecret.value = ''
        updateSetting({ 'lastfm.enabled': true })
      }
    }
    const disconnect = async () => {
      if (await run({ action: 'disconnect' })) updateSetting({ 'lastfm.enabled': false })
    }
    const refresh = () => run({ action: 'status' })
    void refresh()
    return {
      appSetting,
      updateSetting,
      lastfm,
      apiKey,
      apiSecret,
      busy,
      errorMessage,
      authorize,
      complete,
      disconnect,
      refresh,
      openUrl,
    }
  },
}
</script>

<style lang="less" module>
.fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  label {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 420px;
    font-size: 13px;
  }
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
