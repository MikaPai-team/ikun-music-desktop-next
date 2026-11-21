<template>
  <div :class="$style.container">
    <div :class="$style.songListHeader">
      <div
        :class="$style.songListHeaderLeft"
        :style="{ backgroundImage: 'url(' + (picUrl || listDetailInfo.info.img) + ')' }"
      >
        <!-- <span v-if="listDetailInfo.info.play_count" :class="$style.playNum">{{ listDetailInfo.info.play_count }}</span> -->
      </div>
      <div :class="$style.songListHeaderMiddle">
        <h3 :title="listDetailInfo.info.name">{{ listDetailInfo.info.name }}</h3>
        <p :title="listDetailInfo.info.desc">{{ listDetailInfo.info.desc }}</p>
      </div>
      <div :class="$style.songListHeaderRight">
        <base-btn
          :class="$style.headerRightBtn"
          :disabled="!!listDetailInfo.noItemLabel"
          @click="playSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.list)"
        >
          {{ $t('list__play') }}
        </base-btn>
        <base-btn
          :class="$style.headerRightBtn"
          :disabled="!!listDetailInfo.noItemLabel"
          @click="
            addSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.info.name)
          "
        >
          {{ $t('list__collect') }}
        </base-btn>
        <base-btn :class="$style.headerRightBtn" @click="handleBack">{{ $t('back') }}</base-btn>
      </div>
    </div>
    <div :class="$style.list">
      <material-online-list
        ref="listRef"
        :page="listDetailInfo.page"
        :limit="listDetailInfo.limit"
        :total="listDetailInfo.total"
        :list="listDetailInfo.list"
        :no-item="listDetailInfo.noItemLabel"
        @play-list="handlePlayList"
        @toggle-page="togglePage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch } from '@common/utils/vueTools'
import { listDetailInfo } from '@renderer/store/songList/state'
import { setVisibleListDetail } from '@renderer/store/songList/action'
import { useRouter } from '@common/utils/vueRouter'
import { addSongListDetail, playSongListDetail } from './action'
import useList from './useList'
import useKeyBack from './useKeyBack'

const source = ref<LX.OnlineSource>('kw')
const id = ref<string>('')
const page = ref<number>(1)
const picUrl = ref<string>('')
const refresh = ref<boolean>(false)

interface Query {
  source?: string
  id?: string
  page?: string
  picUrl?: string
  refresh?: 'true'
  fromName?: string
}

const verifyQueryParams = async function (
  this: any,
  to: { query: Query; path: string },
  from: any,
  next: (route?: { path: string; query: Query }) => void
) {
  let _source = to.query.source
  let _id = to.query.id
  let _page: string | undefined = to.query.page
  let _picUrl: string | undefined = to.query.picUrl
  let _refresh: 'true' | undefined = to.query.refresh

  if (_source == null || _id == null) {
    if (listDetailInfo.key) {
      _source = listDetailInfo.source
      _id = listDetailInfo.id
      _page = listDetailInfo.page.toString()
      _picUrl = listDetailInfo.info.img
    } else {
      setVisibleListDetail(false)
      next({ path: '/songList/list', query: {} })
      return
    }

    next({
      path: to.path,
      query: {
        ...to.query,
        source: _source,
        id: _id,
        page: _page,
        picUrl: _picUrl,
        refresh: _refresh,
      },
    })
    return
  }
  next()
  setVisibleListDetail(true)
  source.value = _source as LX.OnlineSource
  id.value = _id
  page.value = _page ? parseInt(_page) : 1
  picUrl.value = _picUrl ?? ''
  refresh.value = _refresh ? _refresh == 'true' : false
  if (to.query.fromName) window.lx.songListInfo.fromName = to.query.fromName
}

export default {
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const router = useRouter()

    const { listRef, listDetailInfo, getListData, handlePlayList } = useList()

    const togglePage = (page: number) => {
      void getListData(source.value, id.value, page, refresh.value)
    }

    const handleBack = () => {
      setVisibleListDetail(false)
      if (window.lx.songListInfo.fromName)
        void router.replace({ name: window.lx.songListInfo.fromName })
      else router.back()
    }

    useKeyBack(handleBack)

    watch(
      [source, id, page, refresh],
      async ([_source, _id, _page, _refresh]) => {
        if (!_source || !_id) return router.replace({ path: '/songList/list' })
        // console.log(_source, _id, _page, _refresh, picUrl.value)
        // source.value = _source
        // id.value = _id
        // refresh.value = _refresh
        // page.value = _page ?? 1
        void getListData(_source, _id, _page, _refresh)
      },
      {
        immediate: true,
      }
    )

    return {
      source,
      id,
      page,
      picUrl,
      listDetailInfo,
      listRef,
      togglePage,
      addSongListDetail,
      playSongListDetail,
      handlePlayList,
      handleBack,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.container {
  display: flex;
  flex-flow: column nowrap;
  min-height: 0;
  overflow: hidden;
}
.songListHeader {
  .mixin-page-header();
  gap: 14px;
}
.songListHeaderLeft {
  flex: none;
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 10px;
  background-position: center;
  background-size: cover;
  background-color: var(--color-control-fill);
}
.songListHeaderMiddle {
  flex: 1 1 160px;
  min-width: 0;
  h3 {
    .mixin-page-title();
    .mixin-ellipsis-1();
  }
  p {
    .mixin-ellipsis(3);
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-font-label);
  }
}
.songListHeaderRight {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.headerRightBtn {
  min-height: 38px;
}
.list {
  position: relative;
  width: 100%;
  min-height: 0;
  flex: auto;
}
@media (max-width: 700px) {
  .songListHeaderRight {
    flex-basis: 100%;
  }
}
</style>
