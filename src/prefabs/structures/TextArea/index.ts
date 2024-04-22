import { PrefabComponent } from '@betty-blocks/component-sdk/build/prefabs/types/component';
import { Configuration } from '../Configuration';
import { TextInput } from '../TextInput';
import { options as defaults } from './options/index';

export const TextArea = (
  config: Configuration,
  children: PrefabComponent[] = [],
) => {
  const options = { ...(config.options || defaults) };
  const label = config.label ? config.label : undefined;

  config.optionCategories = [
    {
      label: 'Validation Options',
      expanded: false,
      members: [
        'required',
        'validationValueMissing',
        'pattern',
        'validationPatternMismatch',
        'minLength',
        'validationTooShort',
        'maxLength',
        'validationTooLong',
        'maxWordCount',
        'validationExceedWordCount',
      ],
    },
    {
      label: 'Styling',
      expanded: false,
      members: [
        'hideLabel',
        'backgroundColor',
        'borderColor',
        'borderHoverColor',
        'borderFocusColor',
        'labelColor',
        'textColor',
        'placeholderColor',
        'helperColor',
        'errorColor',
      ],
    },
    {
      label: 'Advanced Options',
      expanded: false,
      members: ['debounceDelay', 'dataComponentAttribute'],
    },
  ]
  return TextInput({ ...config, options, label }, children);
};
