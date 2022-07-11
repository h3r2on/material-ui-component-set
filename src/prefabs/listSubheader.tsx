import { prefab, Icon } from '@betty-blocks/component-sdk';
import { ListSubHeader } from './structures/ListSubHeader';

const attr = {
  icon: Icon.OrderedListIcon,
  category: 'LIST',
  keywords: ['List', 'sub', 'header', 'subheader', 'listsubheader'],
};

export default prefab('List subheader (TS)', attr, undefined, [
  ListSubHeader({}, []),
]);
