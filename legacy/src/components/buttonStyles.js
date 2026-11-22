import styled from 'styled-components';
import { Button } from 'antd';

export const RedButton = styled(Button)`
  && {
    background-color: #f00;
    color: white;
    border: none;
    margin-left: 4px;
    &:hover {
      background-color: #eb7979 !important;
      color: white !important;
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: #000000;
    color: white;
    border: none;
    margin-left: 4px;
    &:hover {
      background-color: #212020 !important;
      color: white !important;
    }
  }
`;

export const DarkRedButton = styled(Button)`
  && {
    background-color: #650909;
    color: white;
    border: none;
    &:hover {
      background-color: #eb7979 !important;
      color: white !important;
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background-color: #080a43;
    color: #fff;
    border: none;
    &:hover {
      background-color: #0a1e82 !important;
      color: white !important;
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: #270843;
    color: #fff;
    border: none;
    &:hover {
      background-color: #3f1068 !important;
      color: white !important;
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background-color: #7f56da;
    color: #fff;
    border: none;
    &:hover {
      background-color: #7a1ccb !important;
      color: white !important;
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: #133104;
    color: #fff;
    border: none;
    &:hover {
      background-color: #266810 !important;
      color: white !important;
    }
  }
`;

export const BrownButton = styled(Button)`
  && {
    background-color: #2c1006;
    color: white;
    border: none;
    &:hover {
      background-color: #40220c !important;
      color: white !important;
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: #2f2b80;
    color: white;
    border: none;
    &:hover {
      background-color: #534ea6 !important;
      color: white !important;
    }
  }
`;
