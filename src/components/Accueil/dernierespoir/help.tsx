import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineZoomIn } from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  statut,
  statutToString,
  statutToStyle,
} from "../../../utils/StatutUtils";
import decodeToken from "../../../auth/decodeToken";
import {
  filtre,
  getFiltre,
  domaines,
  GetFullFilter,
} from "../ComposantAccueil/FiltreAccueil";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Autocomplete,
  Stack,
  TextField,
  Grid,
} from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

export interface formation {
  association: {
    acronyme: string;
    nomComplet: string;
  };
  cadre?: string;
  domaines: domaines[];
  formateurs: {
    id: number;
    nom: string;
    prenom: string;
  }[];
  statut: statut;
  nom?: string;
  sujet: string;
  date?: string;
  id: number;
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

const INITIAL_FILTRE: filtre = {
    date_debut: "",
    date_fin: "",
    statut: [],
    domaines: [],
    cadre: [],
    sujet: "",
    asso: [],
    formateurs: [],
  }

type Props = { data: formation[] };

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
}

function Filtres(data: formation[], filtre: filtre): formation[] {
  const newdata: formation[] = [];
  let checkFormateur: boolean;
  let checkDomaine: boolean;
  let checkDomaineUnit: boolean;
  data.map((data) => {
    checkFormateur = true;
    checkDomaine = true;
    if (
      (filtre.statut.includes(statutToString(data.statut)) ||
        filtre.statut.length == 0) &&
      (filtre.cadre.length == 0 || filtre.cadre.includes(data.cadre)) &&
      (filtre.asso.length == 0 ||
        filtre.asso.includes(data.association.acronyme)) &&
      (data.nom
        ? data.nom.includes(filtre.sujet)
        : data.sujet.includes(filtre.sujet))
    ) {
      data.formateurs.map((formateur) => {
        if (
          !filtre.formateurs.includes(formateur.prenom + " " + formateur.nom) &&
          filtre.formateurs.length != 0
        ) {
          checkFormateur = false;
        }
      });
      if (data.formateurs.length == 0 && filtre.formateurs.length != 0) {
        checkFormateur = false;
      }

      filtre.domaines.forEach((libelle) => {
        checkDomaineUnit = false;
        data.domaines.map((domaine) => {
          if (domaine.libelle == libelle) {
            checkDomaineUnit = true;
          }
        });
        if (!checkDomaineUnit) {
          checkDomaine = false;
        }
      });

      if (checkDomaine && checkFormateur) {
        newdata.push(data);
      }
    }
  });

  return newdata;
}

function Help(unFilteredData: formation[]) {

console.log(unFilteredData)

  const fullFiltre = GetFullFilter(unFilteredData);

console.log(fullFiltre)


  let filtre = INITIAL_FILTRE;  

  let data = Filtres(unFilteredData, filtre);

  function setFiltre(newfiltre : filtre) {
    filtre = newfiltre
    data = Filtres(unFilteredData, filtre)
}
  console.log(data)

  let newfiltre : filtre = filtre;

  console.log("help with " + data);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [liveness, setLiveness] = useState(0);

  useEffect(() => {
      setLiveness(liveness + 1)
  }, [filtre])

  const domaineLibelleList = (domaines) => {
    let list = [];
    domaines.map((domaine) => {
      list.push(domaine.libelle);
    });
    return list;
  };

  data.sort((a, b) => a.id - b.id);

  const checkRoleAsso = () => {
    const token = decodeToken(localStorage.getItem("accessToken")).decoded;
    return token.role === "ROLE_ASSO";
  };

  const checkRoleBn = () => {
    const token = decodeToken(localStorage.getItem("accessToken")).decoded;
    return token.role === "ROLE_BN";
  };

  const checkRoleFormateur = () => {
    const token = decodeToken(localStorage.getItem("accessToken")).decoded;
    return token.role === "ROLE_FORMATEUR";
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={3} marginTop={5}>
          <Grid marginLeft={6}>
            <Stack spacing={1} sx={{ width: 300 }}>
              <Autocomplete
                freeSolo
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.statut}
                onChange={(event, value) => {
                  newfiltre.statut = value;
                  setFiltre(newfiltre);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Statut"
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                  />
                )}
              />
              <Autocomplete
                freeSolo
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.domaines}
                onChange={(event, value) => {
                  newfiltre.domaines = value;
                  setFiltre(newfiltre);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Domaines"
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                  />
                )}
              />
              <Autocomplete
                freeSolo
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.cadre}
                onChange={(event, value) => {
                  newfiltre.cadre = value;
                  setFiltre(newfiltre);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cadre"
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                  />
                )}
              />

              <TextField
                id="outlined-basic"
                label="Sujet/nom"
                variant="outlined"
                onInput={(event) => {
                  newfiltre.sujet = event.currentTarget.ariaValueText;
                  setFiltre(newfiltre);
                }}
              />

              <Autocomplete
                freeSolo
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.asso}
                onChange={(event, value) => {
                  newfiltre.asso = value;
                  setFiltre(newfiltre);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Association"
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                  />
                )}
              />

              <Autocomplete
                freeSolo
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.formateurs}
                onChange={(event, value) => {
                  newfiltre.formateurs = value;
                  setFiltre(newfiltre);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Formtateurs"
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                  />
                )}
              />
            </Stack>
          </Grid>
        </Grid>
        <Grid xs={9}>
          <div className="container-fluid" id="accueil">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Cadre</TableCell>
                  <TableCell align="center">Domaine(s)</TableCell>
                  <TableCell align="center">Titre</TableCell>
                  <TableCell align="center">Association</TableCell>
                  <TableCell align="center" hidden={!checkRoleBn()}>
                    Formateur(s)
                  </TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableHead>
                <TableBody>
                  {data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id}>
                        <TableCell
                          align="center"
                          style={{ color: statutToStyle(row.statut) }}
                        >
                          {statutToString(row.statut)}
                        </TableCell>
                        <TableCell align="center">
                          {row.cadre == null ? "N/A" : row.cadre}
                        </TableCell>
                        <TableCell
                          align="center"
                          title={domaineLibelleList(row.domaines).join(", ")}
                        >
                          {domaineLibelleList(row.domaines).join(", ").length >
                          40
                            ? domaineLibelleList(row.domaines)
                                .join(", ")
                                .substring(0, 40) + "..."
                            : domaineLibelleList(row.domaines).join(", ")}
                        </TableCell>
                        <TableCell align="center">
                          {row.nom != null
                            ? row.nom
                            : "Provisoire : " + row.sujet}
                        </TableCell>
                        <TableCell
                          align="center"
                          title={row.association.nomComplet}
                        >
                          {row.association.acronyme}
                        </TableCell>
                        <TableCell align="center" hidden={!checkRoleBn()}>
                          {row.formateurs.map(
                            (formateur) =>
                              formateur.prenom + " " + formateur.nom
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.date == null ? "N/A" : row.date}
                        </TableCell>
                        <TableCell align="center">
                          <Link to={"/formation/" + row.id}>
                            <AiOutlineZoomIn className="Icones me-2" />
                          </Link>
                          {checkRoleAsso() ? (
                            <></>
                          ) : (
                            <Link to={"/formation/edit/" + row.id}>
                              <AiOutlineEdit className="Icones me-2" />
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 15]}
                      count={data.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      SelectProps={{
                        inputProps: {
                          "aria-label": "Lignes par page",
                        },
                        native: true,
                      }}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      ActionsComponent={TablePaginationActions}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default Help;