import {
  claimRewards,
  selectClaimSelections,
  selectIsDelegationSigned,
  setClaimStep,
  signTokenDelegationData,
  selectCurrentlyClaiming,
} from "@tallyho/tally-background/redux-slices/claim"
import {
  clearTransactionState,
  TransactionConstructionStatus,
} from "@tallyho/tally-background/redux-slices/transaction-construction"
import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useMemo,
} from "react"
import { useHistory } from "react-router-dom"
import { useBackgroundDispatch, useBackgroundSelector } from "../../hooks"
import SharedButton from "../Shared/SharedButton"
import SharedProgressIndicator from "../Shared/SharedProgressIndicator"

interface ClaimFooterProps {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  advanceStep: () => void
  showSuccess: () => void
}

export default function ClaimFooter({
  step,
  setStep,
  advanceStep,
  showSuccess,
}: ClaimFooterProps): ReactElement {
  const history = useHistory()
  const dispatch = useBackgroundDispatch()

  const { selectedDelegate } = useBackgroundSelector(selectClaimSelections)
  const isDelegationSigned = useBackgroundSelector(selectIsDelegationSigned)
  const isCurrentlyClaiming = useBackgroundSelector(selectCurrentlyClaiming)
  const claimState = useBackgroundSelector((state) => state.claim)

  const lastStepButtonText = useMemo(() => {
    if (selectedDelegate.address !== undefined && !isDelegationSigned) {
      return "Sign Delegation"
    }
    if (isCurrentlyClaiming) {
      return "Claiming..."
    }
    return "Claim"
  }, [isCurrentlyClaiming, isDelegationSigned, selectedDelegate.address])

  const buttonText = useMemo(
    () => [
      "Get started",
      "Continue",
      "Continue",
      "Continue",
      lastStepButtonText,
    ],
    [lastStepButtonText]
  )

  if (isCurrentlyClaiming) {
    showSuccess()
  }
  const handleClick = useCallback(async () => {
    // FIXME Set state to pending so SignTransaction doesn't redirect back; drop after
    // FIXME proper transaction queueing is in effect.
    await dispatch(clearTransactionState(TransactionConstructionStatus.Pending))
    if (buttonText[step - 1] === "Sign Delegation") {
      dispatch(signTokenDelegationData())
      history.push("/sign-data")
    } else if (buttonText[step - 1] === "Claim") {
      dispatch(claimRewards(claimState))
      history.push("/sign-transaction")
    } else {
      advanceStep()
    }
  }, [buttonText, step, advanceStep, dispatch, history, claimState])

  const handleProgressStepClick = (s: number) => {
    setStep(s)
    dispatch(setClaimStep(s))
  }

  return (
    <footer>
      <div className="steps">
        {step < 5 && (
          <SharedProgressIndicator
            activeStep={step - 1}
            onProgressStepClicked={(s) => handleProgressStepClick(s)}
            numberOfSteps={3}
          />
        )}
      </div>
      <SharedButton
        type="primary"
        size="medium"
        onClick={handleClick}
        isDisabled={isCurrentlyClaiming}
      >
        {buttonText[step - 1]}
      </SharedButton>
      <style jsx>
        {`
          footer {
            position: relative;
            width: 352px;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0 auto;
            margin-bottom: 16px;
          }
          .steps {
            display: flex;
            width: 100px;
          }
          .active {
            width: 16px;
            height: 6px;
            background: var(--trophy-gold);
            border-radius: 100px;
            transition: all 0.5s ease-out;
            margin: 0 2px;
          }
          .inactive {
            width: 6px;
            height: 6px;
            background: var(--green-60);
            border-radius: 100px;
            transition: all 0.5s ease-in;
            margin: 0 2px;
          }
        `}
      </style>
    </footer>
  )
}
