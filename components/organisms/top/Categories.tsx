import { FC, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Grid, Text, useDisclosure } from '@chakra-ui/react'
import BasicButton from 'components/atoms/buttons/Basic'
import CategoryButton from 'components/atoms/buttons/Category'
import Cloud from 'components/atoms/emissions/Cloud'
import DatasourceFooter from 'components/DatasourceFooter'
import CategoryModal from 'components/molecules/top/CategoryModal'
import PieChart from 'components/molecules/top/PieChart'
import { useEmissionResult } from 'hooks/emission'

const TopCategories: FC = () => {
  const router = useRouter()
  const emission = useEmissionResult('all')

  const { isOpen, onClose, onOpen } = useDisclosure()
  const [modalCategory, setModalCategory] =
    useState<Questions.QuestionCategory>('mobility')

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
        <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gridGap={3}>
          <Box>
            <CategoryButton
              category="housing"
              onClick={() => selectCategory('housing')}
            />
          </Box>
          <Box>
            <CategoryButton
              category="food"
              onClick={() => selectCategory('food')}
            />
          </Box>
          <Box>
            <CategoryButton
              category="mobility"
              onClick={() => selectCategory('mobility')}
            />
          </Box>
          <Box>
            <CategoryButton
              category="other"
              onClick={() => selectCategory('other')}
            />
          </Box>
        </Grid>
      </Box>

      {emission?.profile?.shareId && (
        <Text textAlign="right" fontSize="xs" mt={2}>
          識別ID: {emission.profile.shareId}
        </Text>
      )}

      {housing || food || mobility || other ? (
        <>
          <Box mt={8}>
            <BasicButton
              isNext
              onClick={() => router.push('/actions')}
              width="full"
            >
              脱炭素アクションをみる
            </BasicButton>
          </Box>
          <Box mt={3}>
            <BasicButton
              isNext
              onClick={() => router.push('/society')}
              width="full"
              variant="outline"
              color="brandPrimary.400"
              border="2px solid #009ACE!important"
            >
              社会へ働きかけるには
            </BasicButton>
          </Box>
        </>
      ) : (
        ''
      )}

      <Box mt={10}>
        <DatasourceFooter />
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
