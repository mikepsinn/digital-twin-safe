import { IconText, Loader, Menu, Text, Breadcrumb, BreadcrumbElement } from '@gnosis.pm/safe-react-components'
import { useState } from 'react'
import styled, { css } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

import Collapse from 'src/components/Collapse'
import Col from 'src/components/layout/Col'
import { SearchInputCard } from './SearchInputCard'
import { NoVariablesFound } from './NoVariablesFound'
import { useVariableList } from '../hooks/variableList/useVariableList'
import { useVariablesSearch } from '../hooks/useVariablesSearch'
import UserVariableCard from 'src/routes/safe/components/Variables/components/UserVariableCard/UserVariableCard'
import { PinnedVariablesTutorial } from './PinnedVariablesTutorial'
import useSafeAddress from 'src/logic/currentSession/hooks/useSafeAddress'

export const PINNED_VARIABLES_LIST_TEST_ID = 'safe_variables__pinned-apps-container'
export const ALL_VARIABLES_LIST_TEST_ID = 'safe_variables__all-apps-container'

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const centerCSS = css`
  display: flex;
  align-items: center;
  justify-content: center;
`

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  ${centerCSS};
`

const CardsWrapper = styled(motion.div)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(243px, 1fr));
  column-gap: 20px;
  row-gap: 20px;
  justify-content: space-evenly;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
`

const SectionHeading = styled(Text)`
  width: 100%;
  margin: ${({ theme }) => `${theme.margin.xl} 0 ${theme.margin.md} 0`};
`

const CenterIconText = styled(IconText)`
  justify-content: center;
  margin: 16px 55px 20px 0;
`

const VariablesList = (): React.ReactElement => {
  const { safeAddress } = useSafeAddress()
  const [variableSearch, setVariableSearch] = useState('')
  const { variableList, isLoading, pinnedUserVariables, togglePin } = useVariableList()
  const variables = useVariablesSearch(variableList, variableSearch)
  const noVariablesFound = variables.length === 0 && variableSearch
  const showPinnedVariables = !variableSearch

  if (isLoading || !safeAddress) {
    return (
      <LoadingContainer>
        <Loader size="md" />
      </LoadingContainer>
    )
  }

  return (
    <Wrapper>
      <Menu>
        <Col start="sm" xs={12}>
          <Breadcrumb>
            <BreadcrumbElement iconType="apps" text="Variables" />
          </Breadcrumb>
        </Col>
      </Menu>
      <ContentWrapper>
        <SearchInputCard
          value={variableSearch}
          onValueChange={(value) => setVariableSearch(value.replace(/\s{2,}/g, ' '))}
        />

        {showPinnedVariables && (
          <Collapse
            title={
              <Text color="placeHolder" strong size="md">
                BOOKMARKED VARIABLES
              </Text>
            }
            defaultExpanded
          >
            {pinnedUserVariables.length === 0 && <PinnedVariablesTutorial />}
            <AnimatePresence>
              <CardsWrapper data-testid={PINNED_VARIABLES_LIST_TEST_ID}>
                {pinnedUserVariables.map((pinnedUserVariable) => (
                  <UserVariableCard
                    key={pinnedUserVariable.id}
                    userVariable={pinnedUserVariable}
                    togglePin={togglePin}
                    size="md"
                    isPinned
                  />
                ))}
              </CardsWrapper>
            </AnimatePresence>
          </Collapse>
        )}

        <SectionHeading color="placeHolder" strong size="md">
          {variableSearch ? 'SEARCH RESULTS' : 'ALL VARIABLES'}
        </SectionHeading>
        {noVariablesFound && (
          <NoVariablesFound query={variableSearch} onWalletConnectSearch={() => setVariableSearch('WalletConnect')} />
        )}
        <AnimatePresence>
          <CardsWrapper data-testid={ALL_VARIABLES_LIST_TEST_ID}>
            {variables.map((safeVariable) => (
              <UserVariableCard
                key={safeVariable.id}
                userVariable={safeVariable}
                togglePin={togglePin}
                isPinned={pinnedUserVariables.some((pinnedUserVariable) => pinnedUserVariable.id === safeVariable.id)}
                size="md"
              />
            ))}
          </CardsWrapper>
        </AnimatePresence>
      </ContentWrapper>

      <CenterIconText
        color="secondary"
        iconSize="sm"
        iconType="info"
        text="Variables are the parameters that define your digital twin"
        textSize="sm"
      />
    </Wrapper>
  )
}

export default VariablesList
