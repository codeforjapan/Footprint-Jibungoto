import { useEffect, useState } from 'react'
import {
  FOOD_ACTIONS,
  MOBILITY_ACTIONS,
  HOUSING_ACTIONS,
  OTHER_ACTIONS
} from 'constants/actions'
import { useProfile, useSharedProfile } from 'hooks/profile'

const compareFunc = (a: Actions.Action, b: Actions.Action) => {
  const resultA = Number(
    a.reductionEffect *
      (Number(a.actionIntensityRate?.value) ||
        Number(a.actionIntensityRate?.defaultValue))
  )
  const resultB = Number(
    b.reductionEffect *
      (Number(b.actionIntensityRate?.value) ||
        Number(b.actionIntensityRate?.defaultValue))
  )

  return resultB - resultA
}

const calculateReductionEffect = (
  option: string,
  baseLines: Profile.EmissionItem[],
  actions: Profile.ActionItem[],
  estimations: Profile.EmissionItem[]
): number => {
  let sumEstimatingFootprint: number = 0,
    sumActionFootprint: number = 0
  const intensityItems = actions
    .filter((action) => action.option === option && action.type === 'intensity')
    .map((action) => {
      return { name: action.item, value: action.value }
    })
  const items = actions
    .filter((action) => action?.option === option)
    .map((action) => {
      const intensity = intensityItems.find(
        (intensityItem) => intensityItem.name === action.item
      )
      const amount = action?.type === 'amount' ? action?.value : undefined
      return {
        name: action.item,
        amountValue: amount,
        intensityValue: intensity?.value,
        domain: action.domain
      }
    })
    .filter(
      (action, index, self) =>
        self.findIndex(
          (e) => e.name === action.name && e.domain === action.domain
        ) === index
    )

  if (!items.length) return 0

  items.forEach((item) => {
    const estimatingAmount = estimations.find(
        (estimation) =>
          estimation.item === item.name &&
          estimation.domain === item.domain &&
          estimation.type === 'amount'
      ),
      estimatingIntensity = estimations.find(
        (estimation) =>
          estimation.item === item.name &&
          estimation.domain === item.domain &&
          estimation.type === 'intensity'
      )
    const baseAmount = baseLines.find(
        (baseLine) =>
          baseLine.item === item.name &&
          baseLine.domain === item.domain &&
          baseLine.type === 'amount'
      ),
      baseIntensity = baseLines.find(
        (baseLine) =>
          baseLine.item === item.name &&
          baseLine.domain === item.domain &&
          baseLine.type === 'intensity'
      )
    const estimatingOrBaseAmount =
        estimatingAmount !== undefined
          ? estimatingAmount.value
          : baseAmount?.value,
      estimatingOrBaseIntensity =
        estimatingIntensity !== undefined
          ? estimatingIntensity.value
          : baseIntensity?.value
    const actionAmount =
        item.amountValue !== undefined
          ? item.amountValue
          : estimatingOrBaseAmount,
      actionIntensity =
        item.intensityValue !== undefined
          ? item.intensityValue
          : estimatingOrBaseIntensity

    sumEstimatingFootprint +=
      !isNaN(estimatingOrBaseAmount) && !isNaN(estimatingOrBaseIntensity)
        ? estimatingOrBaseAmount * estimatingOrBaseIntensity
        : 0
    sumActionFootprint +=
      !isNaN(actionAmount) && !isNaN(actionIntensity)
        ? actionAmount * actionIntensity
        : 0
  })

  return (sumActionFootprint - sumEstimatingFootprint) * -1
}

const combinedActionData = (
  actions: Actions.Action[],
  profile: Profile.Profile
) => {
  const domain = actions[0].domain,
    baselines = profile.baselines.filter(
      (baseline) => baseline.domain === domain
    ),
    baseActions = profile.actions.filter((action) => action.domain === domain),
    estimations = profile.estimations.filter(
      (estimation) => estimation.domain === domain
    )
  actions.forEach((action) => {
    const actionIntensityRate = profile.actionIntensityRates.find(
      (rate) => rate.option === action.option
    )
    if (actionIntensityRate) {
      action.actionIntensityRate = Object.assign({}, actionIntensityRate)
      if (actionIntensityRate.value) action.checked = true
    }
    action.reductionEffect = calculateReductionEffect(
      action.option,
      baselines,
      baseActions,
      estimations
    )
  })

  // 削減施策による効果が0より上のものを表示
  return actions
    .filter((action) => action.reductionEffect > 0)
    .sort(compareFunc)
}

export const useActions = (shareId?: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { profile } = shareId ? useSharedProfile(shareId) : useProfile()
  const [mobility, setMobilityActions] = useState<Actions.Action[]>([])
  const [food, setFoodActions] = useState<Actions.Action[]>([])
  const [housing, setHousingActions] = useState<Actions.Action[]>([])
  const [other, setOtherActions] = useState<Actions.Action[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (profile) {
      setMobilityActions(combinedActionData(MOBILITY_ACTIONS, profile))
      setFoodActions(combinedActionData(FOOD_ACTIONS, profile))
      setHousingActions(combinedActionData(HOUSING_ACTIONS, profile))
      setOtherActions(combinedActionData(OTHER_ACTIONS, profile))
      setLoading(false)
    } else {
      setTimeout(() => setLoading(false), 4000)
    }
  }, [profile])

  return { mobility, food, housing, other, loading }
}

export const useHasActions = () => {
  const actions = useActions()
  let hasActions = false

  const categories: Questions.QuestionCategory[] = [
    'housing',
    'food',
    'mobility',
    'other'
  ]

  const getSelectedActions = (category: Questions.QuestionCategory) => {
    let selectedActions: Actions.Action[] = []
    if (actions[category]) {
      selectedActions = actions[category].filter(
        (action) => action.actionIntensityRate?.value
      )
    }

    return selectedActions
  }

  hasActions =
    categories
      .map((category) => getSelectedActions(category))
      .filter((value) => value.length > 0).length > 0

  return hasActions
}
