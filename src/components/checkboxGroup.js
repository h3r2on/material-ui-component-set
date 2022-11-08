(() => ({
  name: 'CheckboxGroup',
  type: 'CONTENT_COMPONENT',
  allowedTypes: [],
  orientation: 'HORIZONTAL',
  jsx: (() => {
    const {
      actionProperty,
      actionVariableId: name,
      dataComponentAttribute = ['CheckboxGroup'],
      disabled,
      filter,
      fullWidth,
      helperText = [''],
      hideLabel,
      label: labelRaw,
      labelProperty: labelPropertyId = '',
      margin,
      model,
      order,
      orderBy,
      position,
      required,
      row,
      showError,
      size,
      validationValueMissing = [''],
      value: valueRaw,
    } = options;

    const {
      env,
      getIdProperty,
      getModel,
      getProperty,
      useAllQuery,
      useRelation,
      useText,
    } = B;
    const displayError = showError === 'built-in';
    const isDev = env === 'dev';
    const [errorState, setErrorState] = useState(false);
    const [afterFirstInvalidation, setAfterFirstInvalidation] = useState(false);
    const [helper, setHelper] = useState(useText(helperText));
    const [isDisabled, setIsDisabled] = useState(disabled);

    const labelText = useText(labelRaw);
    const dataComponentAttributeValue = useText(dataComponentAttribute);
    const validationValueMissingText = useText(validationValueMissing);
    const helperTextResolved = useText(helperText);
    const defaultValueText = useText(valueRaw, { rawValue: true });

    const modelProperty = getProperty(actionProperty.modelProperty || '') || {};
    const { modelId: propertyModelId, referenceModelId } = modelProperty;
    const modelId = referenceModelId || propertyModelId || model || '';

    const idProperty = getIdProperty(modelId || '') || {};
    const isListProperty =
      modelProperty.kind === 'LIST' || modelProperty.kind === 'list';
    const valueProperty = isListProperty ? modelProperty : idProperty;

    const propertyModel = getModel(modelId);

    const defaultLabelProperty =
      getProperty(
        propertyModel && propertyModel.labelPropertyId
          ? propertyModel.labelPropertyId
          : '',
      ) || {};

    const labelProperty = getProperty(labelPropertyId) || defaultLabelProperty;

    const listValues = valueProperty.values;

    let valid = true;
    let validMessage = '';

    if (!isListProperty && !isDev) {
      if (!modelId) {
        validMessage = 'No model selected';
        valid = false;
      }
    }

    const getValues = () => {
      const value = defaultValueText || [];
      // split the string and trim spaces
      if (Array.isArray(value)) return value;

      return value
        .split(',')
        .filter((part) => part !== '')
        .map((str) => str.trim());
    };

    const [values, setValues] = useState(getValues());

    useEffect(() => {
      B.triggerEvent('onChange', values);
    }, [values]);

    const orderByArray = [orderBy].flat();
    const sort =
      !isDev && orderBy
        ? orderByArray.reduceRight((acc, orderByProperty, index) => {
            const prop = getProperty(orderByProperty);
            return index === orderByArray.length - 1
              ? { [prop.name]: order.toUpperCase() }
              : { [prop.name]: acc };
          }, {})
        : {};

    const {
      loading: queryLoading,
      error: err,
      data: queryData,
      refetch,
    } = useAllQuery(
      model,
      {
        filter,
        take: 50,
        variables: {
          ...(orderBy ? { sort: { relation: sort } } : {}),
        },
        onCompleted(res) {
          const hasResult = res && res.result && res.result.length > 0;
          if (hasResult) {
            B.triggerEvent('onSuccess', res.results);
          } else {
            B.triggerEvent('onNoResults');
          }
        },
        onError(resp) {
          if (!displayError) {
            B.triggerEvent('onError', resp);
          }
        },
      },
      !model,
    );

    const { hasResults, data: relationData } = useRelation(
      model,
      {},
      typeof model === 'string' || !model,
    );

    const data = hasResults ? relationData : queryData;
    const loading = hasResults ? false : queryLoading;

    if (loading) {
      B.triggerEvent('onLoad', loading);
    }

    const { results } = data || {};

    B.defineFunction('Refetch', () => refetch());
    B.defineFunction('Reset', () => setValues(defaultValueText || []));
    B.defineFunction('Enable', () => setIsDisabled(false));
    B.defineFunction('Disable', () => setIsDisabled(true));

    useEffect(() => {
      if (isDev) {
        setValues(getValues());
        setHelper(helperTextResolved);
      }
    }, [isDev, defaultValueText, helperTextResolved]);

    const {
      Checkbox: MUICheckbox,
      FormControlLabel,
      FormControl,
      FormHelperText,
      FormGroup,
      FormLabel,
    } = window.MaterialUI.Core;

    const handleChange = (evt) => {
      const { checked, value } = evt.target;
      setErrorState(false);
      setValues((state) => {
        if (checked) return state.concat(value);
        return state.filter((v) => v !== value);
      });
    };

    const invalidHandler = (event) => {
      event.preventDefault();
      setAfterFirstInvalidation(true);
      setErrorState(true);
    };

    const isValid = required ? values.join() !== '' : true;
    const hasError = errorState || !isValid;

    const renderCheckbox = (checkboxLabel, checkboxValue) => {
      return (
        <FormControlLabel
          control={
            <MUICheckbox
              required={required && !isValid}
              tabIndex={isDev ? -1 : undefined}
              size={size}
            />
          }
          label={checkboxLabel}
          labelPlacement={position}
          checked={values.includes(checkboxValue)}
          onChange={handleChange}
          disabled={isDisabled}
          value={checkboxValue}
          onInvalid={invalidHandler}
        />
      );
    };

    const renderCheckBoxes = () => {
      if (isListProperty) {
        return listValues.map(({ value: v }) => renderCheckbox(v, v));
      }
      if (isDev) return renderCheckbox('Placeholder', false);
      if (loading) return <span>Loading...</span>;
      if (err && displayError) return <span>{err.message}</span>;
      return results.map((item) =>
        renderCheckbox(item[labelProperty.name], `${item[valueProperty.name]}`),
      );
    };

    useEffect(() => {
      if (afterFirstInvalidation) {
        const message = hasError
          ? validationValueMissingText
          : helperTextResolved;
        setHelper(message);
      }
    }, [errorState, values, required, afterFirstInvalidation]);

    const Control = (
      <FormControl
        classes={{ root: classes.formControl }}
        margin={margin}
        component="fieldset"
        required={required}
        error={afterFirstInvalidation && hasError}
        fullWidth={fullWidth}
      >
        {labelText && !hideLabel && (
          <FormLabel component="legend">{labelText}</FormLabel>
        )}
        <FormGroup row={row} data-component={dataComponentAttributeValue}>
          {valid ? renderCheckBoxes() : validMessage}
          <input type="hidden" name={name} value={values} />
        </FormGroup>
        {helper && <FormHelperText>{helper}</FormHelperText>}
      </FormControl>
    );
    return isDev ? <div className={classes.root}>{Control}</div> : Control;
  })(),
  styles: (B) => (t) => {
    const { color: colorFunc, Styling } = B;
    const style = new Styling(t);
    const getOpacColor = (col, val) => colorFunc.alpha(col, val);
    return {
      root: {
        display: ({ options: { fullWidth } }) =>
          fullWidth ? 'block' : 'inline-block',
        '& > *': {
          pointerEvents: 'none',
        },
      },
      formControl: {
        '& > legend': {
          color: ({ options: { labelColor } }) => [
            style.getColor(labelColor),
            '!important',
          ],
          '&.Mui-error': {
            color: ({ options: { errorColor } }) => [
              style.getColor(errorColor),
              '!important',
            ],
          },
          '&.Mui-disabled': {
            pointerEvents: 'none',
            opacity: '0.7',
          },
        },
        '& > p': {
          color: ({ options: { helperColor } }) => [
            style.getColor(helperColor),
            '!important',
          ],
          '&.Mui-error': {
            color: ({ options: { errorColor } }) => [
              style.getColor(errorColor),
              '!important',
            ],
          },
        },
        '& .MuiFormControlLabel-root': {
          '& .MuiCheckbox-root': {
            color: ({ options: { checkboxColor } }) => [
              style.getColor(checkboxColor),
              '!important',
            ],
            '&:hover': {
              backgroundColor: ({ options: { checkboxColor } }) => [
                getOpacColor(style.getColor(checkboxColor), 0.04),
                '!important',
              ],
            },
            '&.Mui-checked': {
              color: ({ options: { checkboxColorChecked } }) => [
                style.getColor(checkboxColorChecked),
                '!important',
              ],
              '&:hover': {
                backgroundColor: ({ options: { checkboxColorChecked } }) => [
                  getOpacColor(style.getColor(checkboxColorChecked), 0.04),
                  '!important',
                ],
              },
            },
          },
          '& .MuiTypography-root': {
            color: ({ options: { textColor } }) => [
              style.getColor(textColor),
              '!important',
            ],
          },
          '&.Mui-disabled': {
            pointerEvents: 'none',
            opacity: '0.7',
          },
        },
      },
    };
  },
}))();
