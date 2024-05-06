import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Inter', sans-serif;
  }
  
  body, input, textarea, button {
    font-family: 'Roboto';
    font-weight: 400;
  }
  
`;
