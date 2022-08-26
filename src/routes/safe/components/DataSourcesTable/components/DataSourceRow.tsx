import React from 'react'
import styled from 'styled-components'
import { Text } from '@gnosis.pm/safe-react-components'
import { updateDataSourceButtonLink } from '../../../../../logic/safe/api/digitalTwinApi'

type Props = {
  data: any
}

class DataSourceButtonsContainer extends React.Component<{ buttons: any; prop1: (item, index) => any }> {
  render() {
    return <ButtonWrapper>{this.props.buttons.map(this.props.prop1)}</ButtonWrapper>
  }
}

const DataSourceRow = ({ data }: Props): React.ReactElement => (
  <ContentWrapper>
    <Title size="lg">{data.displayName}</Title>
    <Content size="md">{data.longDescription}</Content>
    <LeftContent>
      <DataSourceButtonsContainer
        buttons={data.buttons}
        prop1={(item, index) => (
          updateDataSourceButtonLink(item),
          (
            <DataSourceButton key={index} bgColor={item.color} href={item.link}>
              <ButtonIcon src={item.image} />
              {item.text}
            </DataSourceButton>
          )
        )}
      />
    </LeftContent>
  </ContentWrapper>
)

export { DataSourceRow }

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  word-break: break-word;
  white-space: normal;
`
const Title = styled(Text)`
  padding-left: 5px;
`
const Content = styled(Text)`
  margin: ${({ theme }) => `${theme.margin.md} 0 0 0`};
`
const LeftContent = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ theme }) => `${theme.margin.xxl} 0 0 0`};
  width: 600px;
`
const DataSourceButton = styled.a<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.bgColor || '#2ace67'};
  color: #fff;
  border-radius: 0px;
  padding: 6px 12px;
  margin-right: 10px;
  text-decoration: none;
`
const ButtonIcon = styled.img`
  width: 16px;
  margin-right: 5px;
  filter: brightness(0) invert(1);
`
