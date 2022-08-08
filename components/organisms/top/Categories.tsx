import { FC, useMemo, useState } from 'react'
import { Box, Text, useDisclosure } from '@chakra-ui/react'
import CategoryButton from 'components/atoms/buttons/Category'
import Cloud from 'components/atoms/emissions/Cloud'
import CategoryModal from 'components/molecules/top/CategoryModal'
import PieChart from 'components/molecules/top/PieChart'
import { useEmissionResult } from 'hooks/emission'

const TopCategories: FC = () => {
  const emission = useEmissionResult('all')

  const { isOpen, onClose, onOpen } = useDisclosure()
  const [modalCategory, setModalCategory] =
    useState<Questions.QuestionCategory>()

  const mobility = useMemo(() => {
    return emission.mobility.find((f) => f.key === 'total')?.value
  }, [emission])

  const food = useMemo(() => {
    return emission.food.find((f) => f.key === 'total')?.value
  }, [emission])

  const housing = useMemo(() => {
    return emission.housing.find((f) => f.key === 'total')?.value
  }, [emission])

  const other = useMemo(() => {
    return emission.other.find((f) => f.key === 'total')?.value
  }, [emission])

  const totalEmission = useMemo(() => {
    if (!food && !mobility && !housing && !other) {
      return NaN
    } else {
      return Math.round(
        Number(food) + Number(mobility) + Number(housing) + Number(other)
      )
    }
  }, [emission])

  const selectCategory = (category: Questions.QuestionCategory) => {
    setModalCategory(category)
    onOpen()
  }

  return (
    <>
      <Box mt={5}>
        <Cloud amount={totalEmission} />
        <Box pb={3}>
          <PieChart
            mobility={mobility}
            food={food}
            housing={housing}
            other={other}
            onChartClick={(c) => selectCategory(c)}
          />
        </Box>
        <Text mt={5} mb={3} fontWeight="bold" textAlign="center">
          質問に答えると
          <br />
          カーボンフットプリント量がわかる
        </Text>
        <Box mb={3}>
          <CategoryButton
            category="housing"
            onClick={() => selectCategory('housing')}
          />
        </Box>
        <Box mb={3}>
          <CategoryButton
            category="food"
            onClick={() => selectCategory('food')}
          />
        </Box>
        <Box mb={3}>
          <CategoryButton
            category="mobility"
            onClick={() => selectCategory('mobility')}
          />
        </Box>
        <Box mb={3}>
          <CategoryButton
            category="other"
            onClick={() => selectCategory('other')}
          />
        </Box>
      </Box>

      <CategoryModal
        isOpen={isOpen}
        onClose={onClose}
        modalCategory={modalCategory}
      />
    </>
  )
}

export default TopCategories
