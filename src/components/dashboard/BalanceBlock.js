import React, { useState, useContext } from 'react';
import withBalanceBlockState from '../../store/hocs/withBalanceBlockState';
import { LumerinLightIcon } from '../icons/LumerinLightIcon';
import { EtherIcon } from '../icons/EtherIcon';
import { Balance } from './Balance';
import {
  WalletBalanceHeader,
  Btn,
  BtnAccent,
  BtnRow,
  SecondaryContainer,
  Container,
  Primary,
  CoinsRow,
  BalanceContainer,
  GlobalContainer
} from './BalanceBlock.styles';
import Spinner from '../common/Spinner';
import { ToastsContext } from '../toasts';

const WalletBalance = ({
  lmrBalance,
  lmrBalanceUSD,
  ethBalance,
  ethBalanceUSD
}) => (
  <BalanceContainer>
    <CoinsRow>
      <Primary data-testid="lmr-balance">
        <Balance
          currency="LMR"
          value={lmrBalance}
          icon={<LumerinLightIcon size="4rem" />}
          equivalentUSD={lmrBalanceUSD}
          maxSignificantFractionDigits={0}
        />
      </Primary>
      <Primary data-testid="eth-balance">
        <Balance
          currency="ETH"
          value={ethBalance}
          icon={<EtherIcon size="3.3rem" />}
          equivalentUSD={ethBalanceUSD}
          maxSignificantFractionDigits={5}
        />
      </Primary>
    </CoinsRow>
  </BalanceContainer>
);

const BalanceBlock = ({
  lmrBalance,
  lmrBalanceUSD,
  ethBalance,
  ethBalanceUSD,
  sendDisabled,
  sendDisabledReason,
  onTabSwitch,
  client
}) => {
  const handleTabSwitch = e => {
    e.preventDefault();
    onTabSwitch(e.target.dataset.modal);
  };
  const [isClaiming, setClaiming] = useState(false);
  const context = useContext(ToastsContext);

  const claimFaucet = e => {
    e.preventDefault();
    setClaiming(true);
    client
      .claimFaucet({})
      .then(() => {
        context.toast('success', 'Succesfully claimed 10 LMR');
      })
      .catch(err => {
        if (
          err.message &&
          err.message.includes('insufficient funds for gas * price + value')
        ) {
          context.toast('error', 'insufficient funds for gas * price');
        } else {
          context.toast('error', 'You already claimed today. Try later.');
        }
      })
      .finally(() => {
        setClaiming(false);
      });
  };

  return (
    <GlobalContainer>
      <Container>
        <SecondaryContainer>
          <WalletBalance
            {...{ lmrBalance, lmrBalanceUSD, ethBalance, ethBalanceUSD }}
          />
          <BtnRow>
            <BtnAccent
              data-modal="receive"
              data-testid="receive-btn"
              onClick={handleTabSwitch}
              block
            >
              Receive
            </BtnAccent>
            <Btn
              data-modal="send"
              data-disabled={sendDisabled}
              data-rh={sendDisabledReason}
              data-testid="send-btn"
              onClick={sendDisabled ? null : handleTabSwitch}
              block
            >
              Send
            </Btn>
          </BtnRow>
        </SecondaryContainer>
      </Container>
      {isClaiming ? (
        <div style={{ paddingLeft: '20px' }}>
          <Spinner size="25px" />
        </div>
      ) : (
        <BtnAccent
          data-modal="claim"
          onClick={claimFaucet}
          block
          style={{ width: '120px' }}
        >
          Claim Faucet
        </BtnAccent>
      )}
    </GlobalContainer>
  );
};

export default withBalanceBlockState(BalanceBlock);
