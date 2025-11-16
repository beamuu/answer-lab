import type { ReactNode } from 'react'
import styled from 'styled-components'

type ContainerProps = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 640px) {
    padding: 0 14px;
  }
`

export function Container({ children, className, style }: ContainerProps) {
  return (
    <Wrapper className={className} style={style}>
      {children}
    </Wrapper>
  )
}
