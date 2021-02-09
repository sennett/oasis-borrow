import { SendFunction, TxMeta } from '@oasisdex/transactions'
import {
  // CallDef as CallDefAbstractContext,
  createSendTransaction as createSendTransactionAbstractContext,
  createSendWithGasConstraints as createSendWithGasConstraintsAbstractContext,
  estimateGas as estimateGasAbstractContext,
  EstimateGasFunction as EstimateGasFunctionAbstractContext,
  SendTransactionFunction as SendTransactionFunctionAbstractContext,
  TransactionDef as TransactionDefAbstractContext,
} from '@oasisdex/transactions'
import { contractDesc } from 'blockchain/config'
import { GasPrice$ } from 'features/prices'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { TransactionObject } from 'types/web3-v1-contracts/types'

import * as dsProxy from 'blockchain/abi/ds-proxy.json'

import { Context, ContextConnected } from '../network'

export type TransactionDef<A extends TxMeta> = TransactionDefAbstractContext<A, ContextConnected>

export type EstimateGasFunction<A extends TxMeta> = EstimateGasFunctionAbstractContext<
  A,
  ContextConnected
>
export type SendTransactionFunction<A extends TxMeta> = SendTransactionFunctionAbstractContext<
  A,
  ContextConnected
>

function tuple<T extends any[]>(...arg: T) {return arg}

type AbstractContext = {
  status: "connected" | "connectedReadonly"
}

interface CallDefAbstract<C extends AbstractContext = AbstractContext, A = unknown, PA extends readonly any[] = unknown[], R = unknown, PR = unknown> {
  call: (arg: A, ctx: C, addres?: string) => (...arg: PA) => TransactionObject<R>
  prepareArgs?: (arg: A, context: C, addres?: string) => PA
  postprocess?: (returned: R, arg: A, addres?: string) => PR
}

type CallDef<A, PA extends readonly any[], R, PR> = CallDefAbstract<Context, A, PA, R, PR>

function makeCallDef<A = undefined>() {
  return <PA extends readonly any[], R, PR = R>(
    call: (arg: A, ctx: Context, account?: string) => (...arg: PA) => TransactionObject<R>,
    prepareArgs?: (arg: A, context: Context, account?: string) => PA | undefined, 
    postprocess?: (returned: R, arg: A) => PR | undefined,
  ): CallDef<A, PA, R, PR> => ({
    call,
    prepareArgs: prepareArgs ? prepareArgs : a => [a],
    postprocess: postprocess !== undefined ? postprocess : r => r as unknown as PR,
  })
}

export function callAbstractContext<C extends AbstractContext, CD extends CallDefAbstract>(
  context: C,
  { call, prepareArgs, postprocess }: CD,
): typeof prepareArgs extends undefined 
  ? typeof postprocess extends undefined 
    ? () => Observable<CallDefParams<CD>['returned']> 
    : () => Observable<CallDefParams<CD>['postProcessed']> 
  : typeof postprocess extends undefined 
    ? (arg: CallDefParams<CD>['arg']) => Observable<CallDefParams<CD>['returned']> 
    : (arg: CallDefParams<CD>['arg']) => Observable<CallDefParams<CD>['postProcessed']> {
  return args => {
    return from(
      call(
        args,
        context,
      )(...prepareArgs(args, context)).call(
        context.status === 'connected' ? { from: (context as any).account } : {},
      ),
    ).pipe(map((i) => (postprocess ? postprocess(i, args) : i)))
  }
}

type CallDefParams<CD> = CD extends CallDefAbstract<infer C, infer A, infer PA, infer R, infer PR> 
  ? {
    context: C,
    arg: A,
    parsedArg: PA,
    returned: R,
    postProcessed: PR
  }
  : never

export function call<CD extends CallDef<any,any,any,any>>(context: Context, callDef: CD) {
  return callAbstractContext<Context, CD>(context, callDef)
}


const owner = makeCallDef<string>()(
  (dsProxyAddress, { contract }) => contract<DsProxy>(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
)


declare const ctx: Context

ctx.status

type X = CallDefParams<typeof owner>

const called = callAbstractContext({} as Context, owner)

export function estimateGas<A extends TxMeta>(
  context: ContextConnected,
  txDef: TransactionDef<A>,
  args: A,
) {
  return estimateGasAbstractContext<A, ContextConnected>(context, txDef, args)
}

export function createSendTransaction<A extends TxMeta>(
  send: SendFunction<A>,
  context: ContextConnected,
): SendTransactionFunction<A> {
  return createSendTransactionAbstractContext<A, ContextConnected>(send, context)
}

export function createSendWithGasConstraints<A extends TxMeta>(
  send: SendFunction<A>,
  context: ContextConnected,
  gasPrice$: GasPrice$,
) {
  return createSendWithGasConstraintsAbstractContext<A, ContextConnected>(send, context, gasPrice$)
}
