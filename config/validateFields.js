
const validateFields = (fields) => {
    return fields.reduce((errors, field) => {
      if (!field.value) {
        errors.push({ field: field.field, message: `${field.field} is required` });
      }
      return errors;
    }, []);
  };


  export default validateFields