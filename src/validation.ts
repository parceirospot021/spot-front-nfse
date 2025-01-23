import * as yup from 'yup';

const calendarDataSchema = yup
  .object({
    initialDate: yup
      .string()
      .required('Informe a data inicial')
      .typeError('Informe a data inicial')
      .test({
        name: 'maxDate',
        message: 'A data inicial não pode ser maior que a data atual',
        test: function (value) {
          if (value.length === 19) {
            return (
              new Date(value.slice(0, 10).split('-').reverse().join('-') + value.slice(10)) <=
              new Date()
            );
          }
          return new Date(value) <= new Date();
        }
      })
      .test({
        name: 'minDate',
        message: 'A data inicial não pode ser maior que a data final',
        test: function (value) {
          let finalDate = this.parent.finalDate;
          if (!finalDate) return true;
          if (finalDate.length === 19) {
            finalDate = new Date(
              finalDate.slice(0, 10).split('-').reverse().join('-') + finalDate.slice(10)
            );
          }
          if (value.length === 19) {
            return (
              new Date(
                new Date(value.slice(0, 10).split('-').reverse().join('-') + value.slice(10))
              ) < new Date(finalDate)
            );
          }
          return new Date(value) < new Date(finalDate);
        }
      })
      .test({
        name: 'maxRange',
        message: 'O intervalo de datas não pode ser maior que 90 dias',
        test: function (value) {
          let reference = new Date(value);
          let finalDate = this.parent.finalDate;
          if (!finalDate) return true;
          if (finalDate.length === 19) {
            finalDate = new Date(
              finalDate.slice(0, 10).split('-').reverse().join('-') + finalDate.slice(10)
            );
          }
          if (value.length === 19) {
            reference = new Date(
              value.slice(0, 10).split('-').reverse().join('-') + value.slice(10)
            );
          }
          // @ts-expect-error
          const diff = Math.abs(new Date(finalDate) - reference);
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
          return days <= 90;
        }
      })
    ,
    finalDate: yup
      .string()
      .required('Informe a data final')
      .typeError('Informe a data final')
      .test({
        name: 'startDate',
        message: 'A data final deve ser maior que a data inicial',
        test: function (value) {
          let startDate = this.parent.startDate;
          let reference = value;
          if (!startDate) return true;
          if (startDate.length === 19) {
            startDate = startDate.slice(0, 10).split('-').reverse().join('-') + startDate.slice(10);
          }
          if (value.length === 19) {
            reference = value.slice(0, 10).split('-').reverse().join('-') + value.slice(10);
          }
          return new Date(reference) > new Date(startDate);
        }
      })
      .test({
        name: 'maxDate',
        message: 'A data final não pode ser maior que a data atual',
        test: function (value) {
          const currentDate = new Date();
          let reference = value;
          currentDate.setHours(23, 59, 59, 999);
          if (value.length === 19) {
            reference = value.slice(0, 10).split('-').reverse().join('-') + value.slice(10);
          }
          return new Date(reference) <= currentDate;
        }
      })
      .test({
        name: 'maxRange',
        message: 'O intervalo de datas não pode ser maior que 90 dias',
        test: function (value) {
          let reference = value;
          let startDate = this.parent.startDate;
          if (!startDate) return true;
          if (startDate.length === 19) {
            startDate = startDate.slice(0, 10).split('-').reverse().join('-') + startDate.slice(10);
          }
          if (value.length === 19) {
            reference = value.slice(0, 10).split('-').reverse().join('-') + value.slice(10);
          }
          // @ts-expect-error
          const diff = Math.abs(new Date(reference) - new Date(startDate));
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
          return days <= 90;
        }
      })
  })
  .required();

export { calendarDataSchema };
