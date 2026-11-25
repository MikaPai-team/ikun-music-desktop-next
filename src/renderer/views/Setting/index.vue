<template>
  <div :class="$style.main">
    <aside :class="$style.sidebar">
      <div :class="$style.sidebarHeader">
        <h2 :class="$style.pageTitle">{{ $t('setting') }}</h2>
      </div>

      <label :class="$style.searchBox">
        <svg-icon :class="$style.searchIcon" name="search" aria-hidden="true" />
        <input
          v-model="searchText"
          :class="$style.searchInput"
          type="text"
          :placeholder="$t('setting__search_settings')"
          :aria-label="$t('setting__search_settings')"
        />
        <button
          v-if="searchText"
          :class="$style.clearSearch"
          type="button"
          :aria-label="$t('setting__clear_search')"
          @click="clearSearch"
        >
          ×
        </button>
      </label>

      <template v-if="searchText.trim()">
        <p :class="$style.resultsHeading">{{ $t('setting__search_results') }}</p>
        <div v-if="searchResults.length" :class="$style.searchResults">
          <button
            v-for="(result, index) in searchResults"
            :key="result.name + result.label + index"
            type="button"
            :class="[
              $style.searchResult,
              {
                [$style.searchResultActive]:
                  selectedSearchSection === result.name && activeGroupId === result.groupId,
              },
            ]"
            @click="selectSearchResult(result)"
          >
            <span :class="$style.searchResultTitle">{{ result.label }}</span>
            <span :class="$style.searchResultGroup">{{ result.groupTitle }}</span>
          </button>
        </div>
        <p v-else :class="$style.emptySearch">{{ $t('setting__search_no_results') }}</p>
      </template>

      <nav v-else :class="$style.navigation" :aria-label="$t('setting')">
        <button
          v-for="group in tocGroups"
          :key="group.id"
          type="button"
          :class="[$style.navigationItem, { [$style.active]: activeGroupId === group.id }]"
          :aria-current="activeGroupId === group.id ? 'page' : undefined"
          @click="toggleTab(group.id)"
        >
          {{ group.title }}
        </button>
      </nav>
    </aside>

    <main
      id="setting-panel"
      ref="dom_content_ref"
      class="scroll"
      :class="$style.setting"
    >
      <header :class="$style.header">
        <h1>{{ activeGroup.title }}</h1>
        <p v-if="selectedSearchSection">
          {{ getSectionTitle(selectedSearchSection) }}
        </p>
      </header>
      <dl :class="$style.sections">
        <component
          :is="name"
          v-for="name in visibleComponents"
          :key="name"
        />
      </dl>
    </main>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from '@common/utils/vueTools'
import { messages } from '@root/lang'
import { useI18n } from '@renderer/plugins/i18n'
import { useRoute } from '@common/utils/vueRouter'

import SettingBasic from './components/SettingBasic.vue'
import SettingPlay from './components/SettingPlay.vue'
import SettingLastfm from './components/SettingLastfm.vue'
import SettingLyric from './components/SettingLyric.vue'
import SettingDesktopLyric from './components/SettingDesktopLyric.vue'
import SettingSource from './components/SettingSource.vue'
import SettingSearch from './components/SettingSearch.vue'
import SettingList from './components/SettingList.vue'
import SettingDownload from './components/SettingDownload.vue'
import SettingSync from './components/SettingSync/index.vue'
import SettingOpenAPI from './components/SettingOpenAPI.vue'
import SettingNetwork from './components/SettingNetwork.vue'
import SettingCache from './components/SettingCache.vue'
import SettingBackup from './components/SettingBackup.vue'
import SettingHotKey from './components/SettingHotKey.vue'
import SettingOther from './components/SettingOther.vue'
import SettingUpdate from './components/SettingUpdate.vue'
import SettingAbout from './components/SettingAbout.vue'

const sectionDefinitions = [
  {
    name: 'SettingBasic',
    titleKey: 'setting__basic',
    prefixes: ['setting__basic', 'theme_', 'setting__common_start', 'setting__play_timeout'],
  },
  {
    name: 'SettingPlay',
    titleKey: 'setting__play',
    prefixes: ['setting__play', 'setting__player'],
  },
  { name: 'SettingLastfm', titleKey: 'lastfm__enabled', prefixes: ['lastfm__'] },
  {
    name: 'SettingLyric',
    titleKey: 'setting__lyric',
    prefixes: [
      'setting__lyric',
      'setting__local_music_cloud_lyric',
      'setting__play_lyric',
      'setting__player_swap_lyric',
    ],
  },
  {
    name: 'SettingDesktopLyric',
    titleKey: 'setting__desktop_lyric',
    prefixes: ['setting__desktop_lyric', 'desktop_lyric__'],
  },
  {
    name: 'SettingSource',
    titleKey: 'setting__basic_source',
    prefixes: ['setting__basic_source', 'setting__basic_sourcename'],
  },
  {
    name: 'SettingSearch',
    titleKey: 'setting__search',
    prefixes: ['setting__search', 'setting__odc'],
  },
  { name: 'SettingList', titleKey: 'setting__list', prefixes: ['setting__list'] },
  {
    name: 'SettingDownload',
    titleKey: 'setting__download',
    prefixes: ['setting__download', 'setting_download'],
  },
  { name: 'SettingSync', titleKey: 'setting__sync', prefixes: ['setting__sync'] },
  { name: 'SettingOpenAPI', titleKey: 'setting__open_api', prefixes: ['setting__open_api'] },
  { name: 'SettingNetwork', titleKey: 'setting__network', prefixes: ['setting__network'] },
  {
    name: 'SettingCache',
    titleKey: 'setting__cache',
    prefixes: [
      'setting__other_resource_cache',
      'setting__other_other_cache',
      'setting__other_music_url',
      'setting__other_lyric_raw',
      'setting__other_lyric_edited',
      'setting__other_listdata',
      'setting__cache',
    ],
  },
  { name: 'SettingBackup', titleKey: 'setting__backup', prefixes: ['setting__backup'] },
  { name: 'SettingHotKey', titleKey: 'setting__hot_key', prefixes: ['setting__hot_key'] },
  {
    name: 'SettingOther',
    titleKey: 'setting__other',
    prefixes: [
      'setting__other_tray',
      'setting__other_transparent',
      'setting__other_dislike',
      'setting__tray',
    ],
  },
  { name: 'SettingUpdate', titleKey: 'setting__update', prefixes: ['setting__update'] },
  { name: 'SettingAbout', titleKey: 'setting__about', prefixes: ['setting__about'] },
]

export default {
  name: 'Setting',
  components: {
    SettingBasic,
    SettingPlay,
    SettingLastfm,
    SettingLyric,
    SettingDesktopLyric,
    SettingSource,
    SettingSearch,
    SettingList,
    SettingDownload,
    SettingSync,
    SettingOpenAPI,
    SettingNetwork,
    SettingCache,
    SettingBackup,
    SettingHotKey,
    SettingOther,
    SettingUpdate,
    SettingAbout,
  },
  setup() {
    const t = useI18n()
    const route = useRoute()
    const dom_content_ref = ref(null)
    const searchText = ref('')
    const selectedSearchSection = ref(null)
    watch(searchText, () => {
      selectedSearchSection.value = null
    })

    const tocGroups = computed(() => [
      { id: 'basic', title: t('setting__group_basic'), components: ['SettingBasic'] },
      {
        id: 'play',
        title: t('setting__group_play'),
        components: ['SettingPlay', 'SettingLastfm', 'SettingLyric', 'SettingDesktopLyric'],
      },
      {
        id: 'source',
        title: t('setting__group_source'),
        components: ['SettingSource', 'SettingSearch'],
      },
      {
        id: 'library',
        title: t('setting__group_library'),
        components: ['SettingList', 'SettingDownload'],
      },
      {
        id: 'connection',
        title: t('setting__group_connection'),
        components: ['SettingNetwork', 'SettingSync', 'SettingOpenAPI'],
      },
      {
        id: 'tools',
        title: t('setting__group_tools'),
        components: [
          'SettingCache',
          'SettingBackup',
          'SettingHotKey',
          'SettingOther',
          'SettingUpdate',
          'SettingAbout',
        ],
      },
    ])

    const sectionGroup = (name) => tocGroups.value.find((group) => group.components.includes(name))

    const searchResults = computed(() => {
      t('setting')
      const query = searchText.value.trim().toLocaleLowerCase()
      if (!query) return []

      const locale = window.i18n.locale
      const localizedMessages = messages[locale] ?? messages['zh-cn']
      const results = []

      for (const group of tocGroups.value) {
        if (!group.title.toLocaleLowerCase().includes(query)) continue
        results.push({
          name: null,
          label: group.title,
          groupId: group.id,
          groupTitle: group.title,
        })
      }

      for (const [key, value] of Object.entries(localizedMessages)) {
        if (typeof value !== 'string' || value.length > 120) continue
        let section
        let matchedPrefixLength = 0
        for (const item of sectionDefinitions) {
          for (const prefix of item.prefixes) {
            if (key.startsWith(prefix) && prefix.length > matchedPrefixLength) {
              section = item
              matchedPrefixLength = prefix.length
            }
          }
        }
        if (!section || !value.toLocaleLowerCase().includes(query)) continue
        const group = sectionGroup(section.name)
        if (!group) continue
        results.push({
          name: section.name,
          label: value,
          groupId: group.id,
          groupTitle: group.title,
        })
        if (results.length === 12) return results
      }
      return results
    })

    const getInitialGroupId = () => {
      const name = route.query.name
      if (!name) return tocGroups.value[0].id
      const requestedGroup = tocGroups.value.find((group) => group.id === name)
      if (requestedGroup) return requestedGroup.id

      const legacyGroups = {
        lyric: 'play',
        list: 'library',
        network: 'connection',
        storage: 'tools',
        hotkey: 'tools',
        other: 'tools',
      }
      if (legacyGroups[name]) return legacyGroups[name]
      return (
        tocGroups.value.find((group) => group.components.includes(name))?.id ?? tocGroups.value[0].id
      )
    }

    const activeGroupId = ref(getInitialGroupId())
    const activeGroup = computed(
      () => tocGroups.value.find((group) => group.id === activeGroupId.value) ?? tocGroups.value[0]
    )
    const visibleComponents = computed(() =>
      selectedSearchSection.value
        ? [selectedSearchSection.value]
        : activeGroup.value.components
    )

    const getSectionTitle = (name) => {
      const section = sectionDefinitions.find((item) => item.name === name)
      return section ? t(section.titleKey) : ''
    }

    const scrollToTop = () => {
      void nextTick(() => {
        dom_content_ref.value?.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }

    const toggleTab = (id) => {
      if (activeGroupId.value === id && selectedSearchSection.value == null) return
      selectedSearchSection.value = null
      activeGroupId.value = id
      scrollToTop()
    }

    const selectSearchResult = (result) => {
      activeGroupId.value = result.groupId
      selectedSearchSection.value = result.name
      scrollToTop()
    }

    const clearSearch = () => {
      searchText.value = ''
      selectedSearchSection.value = null
    }

    return {
      tocGroups,
      activeGroupId,
      activeGroup,
      dom_content_ref,
      searchText,
      searchResults,
      selectedSearchSection,
      visibleComponents,
      getSectionTitle,
      toggleTab,
      selectSearchResult,
      clearSearch,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.main {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--color-app-background);
}

.sidebar {
  display: flex;
  flex: 0 0 240px;
  flex-direction: column;
  min-height: 0;
  padding: 20px 14px 16px;
  box-sizing: border-box;
  overflow-y: auto;
  border-right: 1px solid var(--color-divider);
  background: var(--color-content-background);
}

.sidebarHeader {
  padding: 0 8px 18px;
}

.pageTitle {
  .mixin-page-title();
  font-size: 20px;
}

.searchBox {
  position: relative;
  display: flex;
  min-height: 38px;
  align-items: center;
  padding: 0 9px;
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  background: var(--color-control-fill);
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--color-accent);
  }
}

.searchIcon {
  flex: none;
  margin-right: 7px;
  color: var(--color-font-label);
}

.searchInput {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-font);
  font: inherit;
  font-size: 13px;

  &::placeholder {
    color: var(--color-font-label);
  }
}

.clearSearch {
  flex: none;
  width: 23px;
  height: 23px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--color-font-label);
  font: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: var(--color-button-background-hover);
    color: var(--color-font);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 20px;
}

.navigationItem {
  position: relative;
  min-height: 39px;
  padding: 8px 11px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--color-font);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: var(--color-button-background-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  &.active {
    border-color: var(--color-primary-alpha-600);
    background: var(--color-primary-alpha-900);
    font-weight: 600;
  }
}

.resultsHeading {
  margin: 19px 8px 8px;
  color: var(--color-font-label);
  font-size: 12px;
}

.searchResults {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}

.searchResult {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--color-font);
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--color-button-background-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  &.searchResultActive {
    border-color: var(--color-primary-alpha-600);
    background: var(--color-primary-alpha-900);
  }
}

.searchResultTitle {
  font-size: 13px;
  line-height: 1.4;
}

.searchResultGroup,
.emptySearch {
  color: var(--color-font-label);
  font-size: 11px;
  line-height: 1.4;
}

.emptySearch {
  margin: 8px;
}

.setting {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 28px 28px;
  box-sizing: border-box;
  overflow-y: auto;
  font-size: 14px;
}

.header {
  max-width: 900px;
  padding: 24px 0 5px;

  h1 {
    margin: 0;
    color: var(--color-font);
    font-size: 21px;
    font-weight: 600;
    line-height: 1.35;
  }

  p {
    margin: 5px 0 0;
    color: var(--color-font-label);
    font-size: 12px;
  }
}

.sections {
  width: 100%;
  max-width: 900px;
  padding: 0;
  margin: 0;

  :global {
    dt {
      margin: 22px 0 9px;
      color: var(--color-font-label);
      font-size: 12px;
      font-weight: 600;
    }

    dd {
      padding: 17px 18px;
      margin: 0 0 11px;
      border: 1px solid var(--color-divider);
      border-radius: 9px;
      background: var(--color-card-background);
    }

    dd > div {
      padding: 0;
    }

    h3 {
      margin: 0 0 12px;
      color: var(--color-font);
      font-size: 13px;
      font-weight: 600;
    }

    h3:not(:first-child) {
      margin-top: 16px;
    }

    .p {
      padding: 3px 0;
      line-height: 1.6;

      .btn + .btn {
        margin-left: 10px;
      }
    }

    .help-btn {
      padding: 0;
      margin: 0 0.4em;
      border: 0;
      background: transparent;
      color: var(--color-button-font);
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.7;
      }
    }

    .help-icon {
      margin: 0 0.4em;
    }
  }
}

@media (max-width: 700px) {
  .sidebar {
    flex-basis: 190px;
    padding: 16px 9px;
  }

  .sidebarHeader {
    padding-left: 6px;
  }

  .setting {
    padding-right: 14px;
    padding-left: 14px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    flex-basis: 145px;
    padding: 12px 6px;
  }

  .pageTitle {
    font-size: 18px;
  }

  .searchBox {
    padding-right: 6px;
    padding-left: 7px;
  }

  .navigationItem {
    padding-right: 7px;
    padding-left: 8px;
    font-size: 12px;
  }

  .setting {
    padding-right: 10px;
    padding-left: 10px;
  }

  .sections :global(dd) {
    padding: 14px 12px;
  }
}
</style>
