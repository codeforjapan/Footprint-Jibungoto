import { FC, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Box, Heading, Spinner, Text } from '@chakra-ui/react'
import BasicButton from 'components/atoms/buttons/Basic'
import Average from 'components/atoms/emissions/Average'
import Cloud from 'components/atoms/emissions/Cloud'
import DatasourceFooter from 'components/DatasourceFooter'
import QuestionResultGraph from 'components/molecules/result/ResultGraph'
import ShareSNS from 'components/molecules/result/ShareSNS/ShareSNS'
import { useEmissionResult } from 'hooks/emission'
import { useProfile } from 'hooks/profile'

type Props = {
  category: Questions.QuestionCategory
}

export const MyResult: FC<Props> = ({ category }) => {
  const router = useRouter()
  const result = useEmissionResult(category)
  const { profile } = useProfile()

  const sortedResult = useMemo(() => {
    const r = result[category]
    return r
      ? r
          .filter((v) => v.key !== 'total' && v.value !== 0)
          .sort((a, b) => b.value - a.value)
      : []
  }, [result])

  const total = useMemo(() => {
    const r = result[category]
    return r ? Math.round(r.find((m) => m.key === 'total')?.value || 0) : 0
  }, [result])

  const additional_hashtag = process.env.NEXT_PUBLIC_TWITTER_SHARE_TAG
    ? `,${process.env.NEXT_PUBLIC_TWITTER_SHARE_TAG}`
    : ''

  const twitterShareLink = useMemo(() => {
    return `https://twitter.com/share?url=${process.env.NEXT_PUBLIC_CLIENT_URL}/category/${category}/result/${profile?.shareId}&text=わたしのカーボンフットプリント量&hashtags=じぶんごとプラネット${additional_hashtag}`
  }, [profile, category])

  const facebookShareLink = useMemo(() => {
    return `https://www.facebook.com/sharer/sharer.php?u=${process.env.NEXT_PUBLIC_CLIENT_URL}/category/${category}/result/${profile?.shareId}`
  }, [profile, category])

  const lineShareLink = useMemo(() => {
    return `https://line.me/R/msg/text/?${process.env.NEXT_PUBLIC_CLIENT_URL}/category/${category}/result/${profile?.shareId}`
  }, [profile, category])

  return (
    <>
      <Heading as="h2" fontSize="18px" textAlign="center" my={5}>
        あなたの1年間の
        <br />
        カーボンフットプリント量
      </Heading>

      <Cloud amount={total} category={category} />
      <Average amount={total} category={category} />

      {result.loading && (
        <Box textAlign="center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color={`${category}.400`}
            size="xl"
          />
        </Box>
      )}

      <QuestionResultGraph category={category} sortedResult={sortedResult} />

      <ShareSNS
        facebook={facebookShareLink}
        line={lineShareLink}
        twitter={twitterShareLink}
      />

      <Text fontWeight="bold" textAlign="center" mt={10} mb={5}>
        カーボンフットプリント量を減らすために
        <br /> できることを考える
      </Text>

      <BasicButton
        width="full"
        isNext
        onClick={() => router.push(`/category/${category}/action`)}
      >
        脱炭素アクションをみる
      </BasicButton>

      <Box mt={8}>
        <DatasourceFooter />
      </Box>
    </>
  )
}

export default MyResult
