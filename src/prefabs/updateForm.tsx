import * as React from 'react';
import {
  component,
  option,
  prefab,
  model,
  filter,
  BeforeCreateArgs,
  Icon,
} from '@betty-blocks/component-sdk';

const beforeCreate = ({
  close,
  components: { CreateFormUpdateWizard },
  prefab: originalPrefab,
  prefabs,
  save,
}: BeforeCreateArgs) => {
  return (
    <CreateFormUpdateWizard
      close={close}
      prefab={originalPrefab}
      prefabs={prefabs}
      save={save}
    />
  );
};

const attributes = {
  category: 'FORMV2',
  icon: Icon.UpdateFormIcon,
};

const options = {
  actionId: option('ACTION_JS', { label: 'Action', value: '' }),
  modelId: model('Model'),
  filter: filter('Filter', { configuration: { dependsOn: 'modelId' } }),
};

export default prefab('Update Form Beta', attributes, beforeCreate, [
  component('Action Form Beta', { options }, []),
]);