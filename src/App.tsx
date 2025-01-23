import { Box, Button, createTheme, Grid2, MenuItem, Select, TextField, ThemeProvider } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { PiMicrosoftExcelLogoLight, PiSpinner } from 'react-icons/pi';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers';
import { CiCalendarDate } from 'react-icons/ci';
import { Controller, useForm } from 'react-hook-form';
import { IMaskMixin } from 'react-imask';
import { yupResolver } from '@hookform/resolvers/yup';
import { calendarDataSchema } from './validation';

interface IParams {
  initialDate: Nullable<Date>
  finalDate: Nullable<Date>
  status: string | null
  municipio: string
  serie: string
  initialRps: string
  finalRps: string
  initialNfse: string
  finalNfse: string
  cnpj_prestador: string
  prestador: string;
  tomador: string;
  cnpj_tomador: string;
  search: string;
  chave_acesso: string;
}


function App() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const finalDate = moment().set('hour', 23).set('minute', 59).set('second', 59).set('millisecond', 59);
  const finalDateNative = new Date(finalDate.toISOString());

  const initDate = moment().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
  const initDateNative = new Date(initDate.toISOString());

  const filterFakeHook = useForm<IParams>({
    mode: 'onChange',
    defaultValues: {
      finalDate: finalDateNative,
      initialDate: initDateNative,
      status: '',
      cnpj_prestador: '',
      cnpj_tomador: '',
      finalNfse: '',
      finalRps: '',
      initialNfse: '',
      initialRps: '',
      municipio: '',
      prestador: '',
      search: '',
      serie: '',
      tomador: ''
    },
    // @ts-ignore
    resolver: yupResolver(calendarDataSchema)
  })
  

  const filterHook = useForm<IParams>({
    mode: 'onChange',
    defaultValues: {
      initialDate: initDateNative,
      finalDate: finalDateNative,
    },
  })

  const [rows, setRows] = useState({
    data: [],
    rowsCount: undefined
  });
  const [state, setState] = useState(false);
  const [isFetchingExcel, setIsFetchingExcel] = useState(false);

  const debounce = (id: string, func: any, timeout = 1000) => {
      return (...args: any) => {
        clearTimeout((window as any)[id]);
        
        (window as any)[id] = setTimeout(function(){
            func(...args); 
        }, timeout);
      };
  }

  const getFormErrorMessage = (name: string) => {
      const errors = filterFakeHook.formState.errors;

      return (errors as any)[name] ? <small className="p-error">{(errors as any)[name].message}</small> : <small className="p-error">&nbsp;</small>;
  };

  const allowOnlyNumber=(value: string| number)=>{
      return String(value).replace(/[^0-9]/g, '')
  }

  const IMaskCNPJInput = IMaskMixin(({ ...props }) => {
    //@ts-ignore
    return <TextField {...props} />;
  });

  const list = () => (
    <Box
      sx={{ width: '50vw' }}
      role="presentation"
      display={'flex'}
      flexDirection={'column'}
      height={'100%'}
    >
      <Box px={3} py={2} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <h2>Filtros</h2>
        <IoIosCloseCircleOutline cursor={'pointer'} size={26} onClick={() => setState(false)} />

      </Box>
      <Divider />
      <Box px={3} py={2} pt={5} display={'flex'} alignItems={'center'} gap={2}>
            <Box width={'100%'} position={'relative'}>
                <Controller
                      name="initialDate"
                      control={filterFakeHook.control}
                      // rules={{ required: 'Date is required.' }}
                      render={({ field }) => (
                          <>
                              <label htmlFor={field.name} style={{position: 'absolute', marginTop: -26, marginLeft: 2}}>Data de emissão</label>
                              <Calendar id="calendar-24h" inputId={field.name}  value={field.value} onChange={field.onChange} placeholder="Data de emissão inicial" style={{width: '100%'}} dateFormat={'dd/mm/yy'} showSeconds icon={<CiCalendarDate />} showTime hourFormat="24" />
                              {getFormErrorMessage(field.name)}
                          </>
                      )}
                  />
            </Box>
            <p style={{marginTop: -8}}>Até</p>
            <Box width={'100%'} alignSelf={'center'}>
              <Controller
                  name="finalDate"
                  control={filterFakeHook.control}
                  // rules={{ required: 'D' }}
                  render={({ field }) => (
                      <>
                          <Calendar id="calendar-24h" inputId={field.name}  value={field.value} onChange={field.onChange} placeholder="Data de emissão inicial" style={{width: '100%'}} dateFormat={'dd/mm/yy'} showSeconds icon={<CiCalendarDate />} showTime hourFormat="24" />
                          {getFormErrorMessage(field.name)}
                      </>
                  )}
              />
            </Box>
      </Box>

      <Grid2 marginTop={-3} container spacing={0} columnSpacing={7} px={3} py={1} alignItems={'center'}>
          <Grid2 size={6}>
            <TextField size='small' fullWidth {...filterFakeHook.register('municipio')} label="Município" variant="outlined" />
          </Grid2>
          <Grid2 size={6} position={'relative'}>
            <Controller
                name="status"
                control={filterFakeHook.control}
                // rules={{ required: 'Date is required.' }}
                render={({ field }) => (
                    <>
                        <label htmlFor={field.name} style={{marginLeft: 2}}>Status</label>
                        <Select
                          size='small'
                          fullWidth
                          value={field.value}
                          labelId="demo-simple-select-label"
                          label="Status"
                          onChange={field.onChange}
                        >
                          <MenuItem value={'Todos'}>Todos</MenuItem>
                          <MenuItem value={'Autorizado'}>Autorizado</MenuItem>
                          <MenuItem value={'Cancelado'}>Cancelado</MenuItem>
                        </Select>
                        {getFormErrorMessage(field.name)}
                    </>
                )}
            />
          </Grid2>
          <Grid2 size={6}>
            <TextField 
              type='text'
              size='small' 
              fullWidth 
              {...filterFakeHook.register('serie')} 
              label="Série" 
              variant="outlined"
              slotProps={{
                htmlInput: {
                  maxLength: 5
                }
              }}
              
        
            />
          </Grid2>
          
          <Grid2 size={6}></Grid2>

          <Grid2 size={6} pt={3}>

              <Controller
                control={filterFakeHook.control}
                name={'initialRps'}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    onChange={(e)=>onChange(allowOnlyNumber(e.target.value))}
                    value={value}
                    fullWidth
                    label="Número RPS Inicial"
                    error={!!error}
                    size='small'
                  />
                )}
              />

          </Grid2>

          <Grid2 size={6} pt={3}>
            <Controller
              name="finalRps"
              control={filterFakeHook.control}
              // rules={{ required: 'Date is required.' }}
              render={({ field: {onChange, value}, fieldState: {error}, }) => (
                <TextField
                  onChange={(e)=>onChange(allowOnlyNumber(e.target.value))}
                  value={value}
                  fullWidth
                  label="Número RPS Final"
                  error={!!error}
                  size='small'
                />
              )}
            />
          </Grid2>

          <Grid2 size={6} pt={3}>

            <Controller
              control={filterFakeHook.control}
              name={'initialNfse'}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  onChange={(e)=>onChange(allowOnlyNumber(e.target.value))}
                  value={value}
                  fullWidth
                  label="Número NFSE Inicial"
                  error={!!error}
                  size='small'
                />
              )}
            />

          </Grid2>

          <Grid2 size={6} pt={3}>
            <Controller
                name="finalNfse"
                control={filterFakeHook.control}
                // rules={{ required: 'Date is required.' }}
                render={({ field: {onChange, value}, fieldState: {error}, }) => (
                  <TextField
                    onChange={(e)=>onChange(allowOnlyNumber(e.target.value))}
                    value={value}
                    fullWidth
                    label="Número NFSE Final"
                    error={!!error}
                    size='small'
                  />
                )}
            />
          </Grid2>

          <Grid2 size={6} pt={3}>
            <TextField size='small' fullWidth {...filterFakeHook.register('prestador')} label="Nome prestador" variant="outlined" />
          </Grid2>

          <Grid2 size={6} pt={3}>
              <Controller
                control={filterFakeHook.control}
                name={'cnpj_prestador'}
                
                render={({ field: { onChange, value }}) => (
                    <IMaskCNPJInput
                      mask="00.000.000/0000-00"
                      definitions={{
                        '#': /[1-9]/,
                      }} 
                      fullWidth
                      onAccept={(value: string) => onChange(String(value).replace(/\D/g, ''))}
                      value={value}
                      label={'CNPJ Prestador'}
                      size={'small'}
                    />
                )}
              />
          </Grid2>
          
          <Grid2 size={6} pt={3}>
            <TextField size='small' fullWidth {...filterFakeHook.register('tomador')} label="Nome tomador" variant="outlined" />
          </Grid2>

          <Grid2 size={6} pt={3}>
              <Controller
                control={filterFakeHook.control}
                name={'cnpj_tomador'}
                render={({ field: { onChange, value } }) => (
                    <IMaskCNPJInput
                      mask="00.000.000/0000-00"
                      definitions={{
                        '#': /[1-9]/,
                      }} 
                      fullWidth
                      onAccept={(value: string) => onChange(String(value).replace(/\D/g, ''))}
                      value={value}
                      label={'CNPJ Tomador'}
                      size={'small'}
                      
                    />
                  )
                }
              />
          </Grid2>

          <Grid2 size={12} pt={3}>
              <Controller
                control={filterFakeHook.control}
                name={'chave_acesso'}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    onChange={(e)=>onChange(allowOnlyNumber(e.target.value))}
                    value={value}
                    fullWidth
                    label="Chave de acesso"
                    error={!!error}
                    size='small'
                  />
                )}
              />

          </Grid2>
          
      </Grid2>
              
      <Box mt={'auto'}>
        <Divider />
        <Box px={3} py={4} display={'flex'} gap={'8px'} alignItems={'center'}>
          <Button variant='contained' 
            disabled={!filterFakeHook.formState.isValid}
            style={{
              background: '#000',
              color: '#CCC',
              opacity: !filterFakeHook.formState.isValid ? 0.4 : 1
            }}
            onClick={() => {
              filterHook.reset({
                ...filterFakeHook.getValues(),
                search: filterHook.getValues('search') || ''
              });
              getData();
              setState(false);
            }}
          >
            Aplicar
          </Button>

          <Button variant='text' 
            style={{
              color: '#CCC'
            }}
            onClick={() => {
              setState(false);
            }}
          >
            Cancelar
          </Button>

          <Button variant='text'
            style={{
              color: '#CCC'
            }} 

            onClick={() => {
              filterFakeHook.reset({
                finalDate: finalDateNative,
                initialDate: initDateNative,
                status: '',
                cnpj_prestador: '',
                cnpj_tomador: '',
                finalNfse: '',
                finalRps: '',
                initialNfse: '',
                initialRps: '',
                municipio: '',
                prestador: '',
                search: '',
                serie: '',
                tomador: ''
              });

              filterHook.reset({
                finalDate: finalDateNative,
                initialDate: initDateNative,
                status: '',
                cnpj_prestador: '',
                cnpj_tomador: '',
                finalNfse: '',
                finalRps: '',
                initialNfse: '',
                initialRps: '',
                municipio: '',
                prestador: '',
                search: '',
                serie: '',
                tomador: ''
              });
              getData();
              setState(false);
            }}
          >
            Restaurar
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'municipio', headerName: 'Município', width: 130 },
    { field: 'num_rps', headerName: 'RPS', width: 130 },
    { field: 'serie', headerName: 'Série', width: 130 },
    { field: 'num_nfse', headerName: 'NFSE', width: 130 },
    { 
      field: 'ref_dataEmissao', 
      headerName: 'Data Emissão', 
      width: 130,
      //@ts-ignore
      renderCell: (param) => moment(param.row?.ref_dataEmissao).utc(-3).format('DD/MM/YYYY[ ]HH:mm:ss')
      // valueGetter: (value) => moment(value).utc().format('DD/MM/YYYY[ ]HH:mm:ss'),
    },
    { field: 'status', headerName: 'Situação', width: 130 },
    { field: 'cnpj_prestador', headerName: 'CNPJ Prestador', width: 130 },
    { field: 'cnpj_tomador', headerName: 'CNPJ Tomador', width: 130 },
    { field: 'prestador', headerName: 'Prestador', width: 130 },
    { field: 'tomador', headerName: 'Tomador', width: 130 },
    { field: 'chave_acesso', headerName: 'Chave acesso', width: 130 },
    { field: 'descricao', headerName: 'Descrição', width: 130 },
    { field: 'end_prestador', headerName: 'Endereço prestador', width: 130 },
    { field: 'valor_iss', headerName: 'Valor ISS', width: 130, 
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }
    },
    { field: 'base_calculo', headerName: 'Base cálculo', width: 130, 
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }

    },
    { field: 'aliquota', headerName: 'Alíquota', width: 130, 
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }
    },
    { field: 'valor_total_tributos_federais', headerName: 'Tributos federais', width: 130,
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }
    },
    { field: 'valor_total_tributos_estaduais', headerName: 'Tributos estaduais', width: 130,
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }
    },
    { field: 'valor_total_tributos_municipais', headerName: 'Tributos municipais', width: 130,
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }
    },
    { field: 'valor_servicos', headerName: 'Valor Serviços', width: 130,

      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }

    },
    { field: 'valor_liquido_nfse', headerName: 'Valor Líquido', width: 130, 
      valueGetter: (value) => {
        const newValue = Number(String(value).split(',')[0])
        return Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2, maximumFractionDigits: 3
        }).format(newValue)
      }
     },
    { 
      field: 'actions', 
      headerName: '', 
      width: 130,
      renderCell: (params: GridRenderCellParams<any, Date>) => <div
        style={{
          display: 'flex',
          alignItems: 'center',
          // justifyContent: 'center',
          height: '100%'
        }}
      >
        <PiMicrosoftExcelLogoLight size={30} style={{cursor: 'pointer', margin: 0, color: '#008000'}} 
          onClick={() => {
            getExcelUniqueRow(params.row?.chave_acesso)
          }}
        />
      </div>
,
    },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25
  })

  function DataTable() {
    return (
      <Paper sx={{ height: 400, width: '100%', minHeight: '100%' }}>
        <DataGrid
          style={{
            width: '100%',
            height: '100%'
          }}
          localeText={{
            noRowsLabel: 'Nenhum resultado encontrado.'
          }}
          loading={isLoading}
          rows={rows.data}
          columns={columns}
          // paginationModel={paginationModel}
          // onPaginationModelChange={setPaginationModel}
          // paginationMode='server'
          initialState={{ pagination: { paginationModel, rowCount: rows.rowsCount } }}
          disableRowSelectionOnClick
          // onPaginationModelChange={(state) => {
          //   setParams({
          //     page: state.page+1,
          //     limit: state.pageSize
          //   });
          // }}
          pageSizeOptions={[25, 50, 100]}
          // checkboxSelection
          sx={{ border: 0 }}
          slotProps={{pagination: {labelRowsPerPage: 'Linhas por página', 
            labelDisplayedRows(paginationInfo) {

              return `Exibindo ${paginationInfo.from} - ${paginationInfo.to} de ${paginationInfo.count} registros`
            }
          }}}
        />
      </Paper>
    );
  }

  const getData = () => {
    const { 
      prestador, 
      cnpj_tomador, 
      finalDate, 
      finalNfse, 
      finalRps, 
      initialDate, 
      initialNfse, 
      initialRps, 
      municipio, 
      search, 
      serie, 
      status, 
      tomador,
      cnpj_prestador,
      chave_acesso
     } = filterHook.getValues();
    let newStatus = status == 'Todos' ? '' : status;
    setIsLoading(true);
    //@ts-ignore
    const startDate = moment(initialDate).utc().toISOString();
    //@ts-ignore
    const endDate = moment(finalDate).utc().toISOString()


    axios.get(`${import.meta.env.VITE_API}/api/nfse?search=${search || ''}&serie=${serie || ''}&initialRps=${initialRps || ''}&finalRps=${finalRps || ''}&initialNfse=${initialNfse || ''}&finalNfse=${finalNfse || ''}&initialDate=${startDate || ''}&finalDate=${endDate || ''}&municipio=${municipio || ''}&cnpj_prestador=${cnpj_prestador || ''}&cnpj_tomador=${cnpj_tomador || ''}&status=${newStatus || ''}&tomador=${tomador || ''}&prestador=${prestador || ''}&chave_acesso=${chave_acesso || ''}
      `)
      // &limit=${paginationModel.pageSize}&page=${paginationModel.page+1}
    .then(({data}) => {
      setRows({
        data: data.nfses,
        rowsCount: data.count
      });
      setIsLoading(false);
    })
    .catch(err => {
      console.log(err);
      setIsLoading(false);
    });
  }

  const getExcelUniqueRow = (chave_acesso: string) => {
      setIsLoading(true);
     axios
     .get(`${import.meta.env.VITE_API}/api/nfse-export?unique=${chave_acesso}`, {
      responseType: 'blob'
     })
     .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${chave_acesso}-${Date.now()}.xlsx`);
          document.body.appendChild(link);
          link.click();
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setIsLoading(false);
      })
  }

  const getExcelAllRows = () => {
    const { 
      prestador, 
      cnpj_tomador, 
      finalDate, 
      finalNfse, 
      finalRps, 
      initialDate, 
      initialNfse, 
      initialRps, 
      municipio, 
      search, 
      serie, 
      status, 
      tomador,
      cnpj_prestador,
      chave_acesso
     } = filterHook.getValues();
     setIsFetchingExcel(true);
     let newStatus = status == 'Todos' ? '' : status;
    //@ts-ignore
    const startDate = moment(initialDate).utc().toISOString();
    //@ts-ignore
    const endDate = moment(finalDate).utc().toISOString();

    const prestador_cnpj = String(cnpj_prestador).replace(/\D/g, '');
    const tomador_cnpj = String(cnpj_tomador).replace(/\D/g, '');

    axios.get(`${import.meta.env.VITE_API}/api/nfse-export?search=${search || ''}&serie=${serie || ''}&initialRps=${initialRps || ''}&finalRps=${finalRps || ''}&initialNfse=${initialNfse || ''}&finalNfse=${finalNfse || ''}&initialDate=${startDate || ''}&finalDate=${endDate || ''}&municipio=${municipio || ''}&cnpj_prestador=${prestador_cnpj || ''}&cnpj_tomador=${tomador_cnpj || ''}&status=${newStatus || ''}&tomador=${tomador || ''}&prestador=${prestador || ''}&chave_acesso=${chave_acesso || ''}
      `, {
        responseType: 'blob'
      })
    .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${initDate}-${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      setIsFetchingExcel(false);
    })
  }


  const sevenRef = moment().subtract('day', 7);
  const fifteenRef = moment().subtract('day', 15);
  const thirtyRef = moment().subtract('day', 30)

  const compare = (diff: number) => diff <= 23 && diff >= 0 ? true : false 
  
  const initialDateSelected = moment(filterHook.getValues('initialDate')).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);

  const isToday = compare(initialDateSelected.diff(initDateNative, 'hour'));
  const isSevenDaysAgo = compare(initialDateSelected.diff(sevenRef, 'hour'));
  const isFifteenDaysAgo = compare(initialDateSelected.diff(fifteenRef, 'hour'));
  const isThirtyDaysAgo = compare(initialDateSelected.diff(thirtyRef, 'hour'));

  useEffect(() => {
    getData();
}, [paginationModel]);

  return (
    <body>
      <ThemeProvider theme={theme}>
        <Box component={'div'} className='test' display={'flex'} gap={4} flexDirection={'column'} mt={'5vh'} alignItems={'center'}>
          <img src='/logo.png' height={80} />
          <Box display={'flex'} flexDirection={'column'}  width={'80vw'} height={'60vh'}>
            <Box display={'flex'} justifyContent={'space-between'} justifyItems={'center'}>
              <Box mb={'8px'} display={'flex'} gap={'16px'} >
                <TextField id="outlined-basic" label="Pesquisar pela RPS" variant="outlined"
                  onChange={(e) => {
                    debounce('search', () => {
             
                      filterHook.setValue('search', allowOnlyNumber(e.target.value), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      })
                      getData();
                    })(e)
                  }}
                />
            
                <Box display={'flex'} gap={'8px'}>
                  <Button variant={isToday ? 'contained' : 'outlined'}
                    onClick={() => {
                      const newValue =  moment().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
                      filterHook.setValue('initialDate', new Date(newValue.toISOString()), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      });
                      filterFakeHook.setValue('initialDate', new Date(newValue.toISOString()), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      });
                      getData();
                    }}
                  >
                    Hoje
                  </Button>
                  <Button variant={isSevenDaysAgo ? 'contained' : 'outlined'}
                   onClick={() => {
                      const newValue =  moment().subtract('day', 6).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
                     
                      filterHook.setValue('initialDate', new Date(newValue.toISOString()), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      filterFakeHook.setValue('initialDate', new Date(newValue.toISOString()), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      getData()
                    }}
                  >
                    7 Dias
                  </Button>
                  <Button variant={isFifteenDaysAgo ? 'contained' : 'outlined'}
                    onClick={() => {
                      const newValue =  moment().subtract('day', 14).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
                      filterHook.setValue('initialDate', new Date(newValue.toISOString()), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      filterFakeHook.setValue('initialDate', new Date(newValue.toISOString()), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      getData()
                    }}
                  >
                    15 Dias
                  </Button>
                  <Button variant={isThirtyDaysAgo ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newValue =  moment().subtract('day', 29).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
                        filterHook.setValue('initialDate', new Date(newValue.toISOString()), {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                        filterFakeHook.setValue('initialDate', new Date(newValue.toISOString()), {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                        getData()
                      }}
                  >
                    30 Dias
                  </Button>

                  <Button variant='outlined' 
                    onClick={() => {
                      setState(!state);
                    }}
                  >
                    Filtros
                  </Button>
                </Box>
              </Box>
                <Box display={'flex'} gap={'8px'} alignItems={'center'}>
                  {isFetchingExcel ? <div className='loader'></div> : ''}
                  <PiMicrosoftExcelLogoLight 
                    
                    size={50} style={{
                      cursor: 'pointer', 
                      margin: 0, marginTop: 8, color: '#008000', opacity: (!rows.data.length || isFetchingExcel) ? 0.4 : 1,
                      pointerEvents: isFetchingExcel ? 'none' : 'auto'
                    }} 
                    onClick={() => {
                      if(rows.data.length && !isFetchingExcel){
                        getExcelAllRows();
                      }
                    }}
                  />
                </Box>
            </Box>
            <DataTable />
          </Box>
        </Box>
        <Drawer
            anchor={'right'}
            open={state}
            onClose={() => {
              filterFakeHook.reset({
                ...filterHook.getValues()
              })
              setState(false)
            }}
          >
            {list()}
        </Drawer>
      </ThemeProvider>
    </body>
  )
}

export default App
