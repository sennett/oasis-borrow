/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { zero } from 'helpers/zero'

import { SLIPPAGE } from '../manageMultiplyQuote'
import { getVaultChange } from '../manageMultiplyVaultCalculations'

describe('Adjust multiply calculations', () => {
  // it('Increase multiply', () => {
  //   const debt = new BigNumber(1000)
  //   const lockedCollateral = new BigNumber(5)
  //   const oraclePrice = new BigNumber(1000)
  //   const marketPrice = new BigNumber(1010)

  //   const requiredCollRatio = new BigNumber(2)

  //   const MULTIPLY_FEE = new BigNumber(0.002)
  //   const LOAN_FEE = new BigNumber(0.009)

  //   const { debtDelta, collateralDelta, loanFee } = getVaultChange({
  //     requiredCollRatio,
  //     debt,
  //     lockedCollateral,
  //     currentCollateralPrice: oraclePrice,
  //     marketPrice,
  //     slippage: SLIPPAGE,
  //     depositAmount: zero,
  //     paybackAmount: zero,
  //     withdrawAmount: zero,
  //     generateAmount: zero,
  //     OF: MULTIPLY_FEE,
  //     FF: LOAN_FEE,
  //   })

  //   const afterCollateralizationRatio = lockedCollateral
  //     .plus(collateralDelta)
  //     .times(oraclePrice)
  //     .div(debt.plus(debtDelta).plus(loanFee))

  //   const afterDebt = debt.plus(debtDelta).plus(loanFee)

  //   expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)

  //   console.log(`
  //   debtDelta ${debtDelta.toFixed()}
  //   collDelta ${collateralDelta.toFixed()}

  //   afterCollRatio ${afterCollateralizationRatio.toFixed()}
  //   afterDebt ${afterDebt.toFixed()}
  // `)
  // })

  it('Increase multiply', () => {
    const debt = new BigNumber(5000)
    const lockedCollateral = new BigNumber(500)
    const oraclePrice = new BigNumber(550)
    const marketPrice = new BigNumber(2000)

    const requiredCollRatio = new BigNumber(1.75)

    const MULTIPLY_FEE = new BigNumber(0.002)
    const LOAN_FEE = new BigNumber(0.009)

    const { debtDelta, collateralDelta, loanFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage: SLIPPAGE,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: MULTIPLY_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    const afterDebt = debt.plus(debtDelta).plus(loanFee)

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)

    console.log(`
    collDelta ${collateralDelta.toFixed()}
    debtDelta ${debtDelta.toFixed()}
    
    afterDebt ${afterDebt.toFixed()}
    afterCollRatio ${afterCollateralizationRatio.toFixed()}
  `)
  })

  it.skip('Decrease multiply', () => {
    const debt = new BigNumber(2000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)

    const requiredCollRatio = new BigNumber(5)

    const MULTIPLY_FEE = new BigNumber(0.01)
    const LOAN_FEE = new BigNumber(0.009)

    const { debtDelta, collateralDelta } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage: SLIPPAGE,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: MULTIPLY_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })
})
