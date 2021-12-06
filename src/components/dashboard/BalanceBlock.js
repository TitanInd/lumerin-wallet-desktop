import withBalanceBlockState from '@lumerin/wallet-ui-logic/src/hocs/withBalanceBlockState';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';
import { LumerinLightIcon } from '../icons/LumerinLightIcon';

import { BaseBtn, DisplayValue } from '../common';

const convertLmrToEth = () => {};

const relSize = ratio => `calc(100vw / ${ratio})`;
const sizeMult = mult => `calc(5px * ${mult})`;

const Container = styled.div`
  margin: 1.6rem 0 1.6rem;
  background-color: ${p => p.theme.colors.xLight};
  width: 70%;
  height: 100px;
  padding: 0 1.6rem 0 1.6rem;
  border-radius: 5px;
  display: flex;
`;

const Balance = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.75em 1.6rem;
  width: 35%;
  @media (min-width: 1040px) {
  }
`;

const CoinSymbol = styled.div`
  border-radius: 14.1px;
  background-color: ${p => p.theme.colors.primary};
  width: 4rem;
  line-height: 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  @media (min-width: 1040px) {
    line-height: 3.2rem;
    width: 6.3rem;
    font-size: 2rem;
  }
`;

const IconLogoContainer = styled.div`
  padding: 2.4rem 1.2rem;
  height: 100px;
  display: none;
  flex-shrink: 0;

  @media (min-width: 800px) {
    display: block;
  }
`;

const Value = styled.div`
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: ${p => (p.large ? '-1px' : 'inherit')};
  color: ${p => p.theme.colors.darker}
  margin: 0 1.6rem;
  flex-grow: 1;
  position: relative;
  // top: ${relSize(-400)};
  // font-size: ${relSize(58)};
  font-size: 3rem;

  @media (min-width: 1440px) {
    font-size: ${({ large }) => (large ? '3.6rem' : '2.8rem')};
  }
`;

const USDValue = styled.div`
  display: block;
  line-height: 1.5;
  font-weight: 600;
  color: ${p => p.theme.colors.darker}
  white-space: nowrap;
  position: relative;
  top: ${relSize(-400)};
  font-size: ${relSize(36)};

  @media (min-width: 800px) {
    font-size: ${relSize(68)};
  }

  @media (min-width: 1440px) {
    font-size: 2.2rem;
  }
`;

const LeftBtn = styled(BaseBtn)`
  width: 45%;
  height: 60%;
  font-size: 1.5rem;
  border-radius: 5px;
  background-color: ${p => p.theme.colors.primary}
  color: ${p => p.theme.colors.light}

  @media (min-width: 1040px) {
    margin-left: 0;
  }
`;

const RightBtn = styled(BaseBtn)`
  width: 45%;
  height: 60%;
  font-size: 1.5rem;
  border-radius: 5px;
  border: 1px solid ${p => p.theme.colors.primary};
  background-color: ${p => p.theme.colors.light}
  color: ${p => p.theme.colors.primary}

  @media (min-width: 1040px) {
    margin-left: 0;
  }
`;

const BtnRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 70%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
`;

function BalanceBlock({
  sendDisabled,
  sendDisabledReason,
  coinBalanceUSD,
  coinBalanceWei,
  lmrBalanceWei,
  CoinSymbol,
  onTabSwitch
}) {
  const handleTabSwitch = e => {
    e.preventDefault();

    onTabSwitch(e.target.dataset.modal);
  };

  return (
    <>
      <Container>
        <IconLogoContainer>
          <LumerinLightIcon size="6rem" />
        </IconLogoContainer>
        <Balance>
          <Value data-testid="lmr-balance" large>
            <DisplayValue value={lmrBalanceWei / 10000000} />
          </Value>
          <USDValue data-testid="lmr-balance-usd" hide>
            ETH ≈ {lmrBalanceWei / 10000000}
          </USDValue>
        </Balance>
        <BtnRow>
          <LeftBtn
            data-modal="receive"
            data-testid="receive-btn"
            onClick={handleTabSwitch}
            block
          >
            Receive
          </LeftBtn>

          <RightBtn
            data-modal="send"
            data-disabled={sendDisabled}
            data-rh={sendDisabledReason}
            data-testid="send-btn"
            onClick={sendDisabled ? null : handleTabSwitch}
            block
          >
            Send
          </RightBtn>
        </BtnRow>
      </Container>
    </>
  );
}

export default withBalanceBlockState(BalanceBlock);
