import { IlkData, IlkDataList } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { VaultSummary } from 'features/vault/vaultSummary'
import maxBy from 'lodash/maxBy'
import minBy from 'lodash/minBy'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { filter, startWith } from 'rxjs/operators'

export interface FeaturedIlk extends IlkData {
  title: string
}

export interface VaultsOverview {
  canOpenVault: boolean
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
  featuredIlks: FeaturedIlk[] | undefined
}

export function getFeaturedIlks(
  ilkDataList: IlkDataList,
  selector: (ilks: IlkDataList) => IlkData | undefined,
  title: string,
): FeaturedIlk | undefined {
  const ilks = ilkDataList.filter(hasAllMetaInfo)
  const featuredIlk = selector(ilks)

  return featuredIlk ? { ...featuredIlk, title } : undefined
}

function hasAllMetaInfo(ilk: IlkData) {
  const token = getToken(ilk.token)

  if (token.symbol !== ilk.token) {
    return false
  }

  return 'icon' in token && 'background' in token && 'color' in token
}

export function getNewest(ilks: IlkDataList) {
  return ilks[ilks.length - 1]
}

export function getMostPopular(ilks: IlkDataList) {
  return maxBy(ilks, (ilk) => ilk.ilkDebt)
}

export function getCheapest(ilks: IlkDataList) {
  return minBy(ilks, (ilk) => ilk.stabilityFee.toNumber())
}

export function createFeaturedIlks$(ilkDataList$: Observable<IlkDataList>) {
  return ilkDataList$.pipe(
    map(ilks => [
      getFeaturedIlks(ilks, getNewest, 'new'),
      getFeaturedIlks(ilks, getMostPopular, 'most-popular'),
      getFeaturedIlks(ilks, getCheapest, 'cheapest'),
    ] as const)
  )
}

export function createVaultsOverview$(
  context$: Observable<ContextConnected>,
  vaults$: (address: string) => Observable<Vault[]>,
  vaultsSummary$: (address: string) => Observable<VaultSummary>,
  ilkDataList$: Observable<IlkDataList>,
  featuredIlks$: Observable<FeaturedIlk[]>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    context$,
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaultsSummary$(address).pipe(startWith<VaultSummary | undefined>(undefined)),
    ilkDataList$.pipe(startWith<IlkDataList | undefined>(undefined)),
    featuredIlks$.pipe(startWith<FeaturedIlk[] | undefined>(undefined)),
  ).pipe(
    map(([context, vaults, vaultSummary, ilkDataList, featuredIlks]) => ({
      canOpenVault: !context.readonly,
      vaults,
      vaultSummary,
      ilkDataList,
      featuredIlks,
    })),
  )
}
