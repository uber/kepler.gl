import styled from 'styled-components';

const PanelTitleFactory = () => styled.div`
  color: ${props => props.theme.titleTextColor};
  font-size: ${props => props.theme.sidePanelTitleFontsize};
  line-height: ${props => props.theme.sidePanelTitleLineHeight};
  font-weight: 400;
  letter-spacing: 1.25px;
  margin-bottom: 14px;
`;

export default PanelTitleFactory;
