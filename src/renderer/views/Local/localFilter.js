export const FILTER_TYPES = ['artists', 'albums', 'folders', 'formats']
export const UNKNOWN_KEY = '__unknown__'
export const emptyFilters = () => Object.fromEntries(FILTER_TYPES.map((type) => [type, []]))

export const parseLocalFilterState = (value) => {
  let state
  try {
    state = JSON.parse(value)
  } catch {
    state = null
  }
  return {
    query: typeof state?.query === 'string' ? state.query : '',
    filters: Object.fromEntries(
      FILTER_TYPES.map((type) => [
        type,
        Array.isArray(state?.filters?.[type])
          ? state.filters[type].filter((key) => typeof key === 'string')
          : [],
      ])
    ),
  }
}

export const normalizeSearch = (value) =>
  String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase()

export const indexLocalMusic = (list) =>
  list.map((music) => {
    const artists = [
      ...new Set(
        (music.singer ?? '')
          .split('、')
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ]
    const path = (music.meta?.filePath ?? '').replace(/\\/g, '/')
    const folder = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) || '/' : ''
    return {
      music,
      artists: artists.length ? artists : [UNKNOWN_KEY],
      albums: [music.meta?.albumName?.trim() || UNKNOWN_KEY],
      folders: [folder || UNKNOWN_KEY],
      formats: [
        (music.meta?.ext || path.match(/\.([^./]+)$/)?.[1] || UNKNOWN_KEY)
          .replace(/^\./, '')
          .toLowerCase(),
      ],
      search: normalizeSearch([music.name, music.singer, music.meta?.albumName, path].join(' ')),
    }
  })

// 同类条件取并集，不同类别和搜索取交集；忽略当前类别，用于计算可选项的曲目数。
export const filterLocalMusic = (index, filters, query = '', ignoredType) => {
  const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean)
  const selections = FILTER_TYPES.filter(
    (type) => type !== ignoredType && filters[type].length
  ).map((type) => [type, new Set(filters[type])])
  return index.filter(
    (item) =>
      words.every((word) => item.search.includes(word)) &&
      selections.every(([type, keys]) => item[type].some((key) => keys.has(key)))
  )
}

export const getFilterOptions = (index, type, available = index) => {
  const counts = new Map()
  for (const item of available) {
    for (const key of item[type]) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const keys = new Set(index.flatMap((item) => item[type]))
  return [...keys]
    .map((key) => ({ key, count: counts.get(key) ?? 0 }))
    .sort((a, b) => {
      if (a.key === b.key) return 0
      if (a.key === UNKNOWN_KEY) return 1
      if (b.key === UNKNOWN_KEY) return -1
      return b.count - a.count || a.key.localeCompare(b.key, 'zh-CN', { numeric: true })
    })
}
