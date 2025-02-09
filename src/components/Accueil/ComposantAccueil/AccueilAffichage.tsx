import React, { useState } from "react";
import { AiOutlineEdit, AiOutlineZoomIn } from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  FetchAssignFormateur,
  FetchLikeFormation,
} from "../../../serverInteraction/FetchFormation";
import useAxiosPrivate from "../../../auth/hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import {
  Statut,
  statutToString,
  statutToStyle,
} from "../../../utils/StatutUtils";
import decodeToken from "../../../auth/decodeToken";
import { domaines, filtre, GetFullFilter } from "./FiltreAccueil";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  Typography,
} from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import UtilisateurIdFormationIdApi from "../../../api/model/UtilisateurIdFormationIdApi";

export interface formation {
  association: {
    id: number;
    acronyme: string;
    nomComplet: string;
  };
  associationsFavorables: {
    id: number;
    acronyme: string;
    nomComplet: string;
  }[];
  cadre?: string;
  domaines: domaines[];
  formateurs: {
    id: number;
    nom: string;
    prenom: string;
  }[];
  statut: Statut;
  nom?: string;
  sujet: string;
  detail: string;
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

interface UserInfo {
  acronyme?: string;
  demandesFavorables?: number[];
  nom?: string;
  prenom?: string;
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
};

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
  let checkFormUnit: boolean;
  data.map((data) => {
    checkFormateur = true;
    checkDomaine = true;
    if (
      (filtre.statut.includes(statutToString(data.statut)) ||
        filtre.statut.length === 0) &&
      (filtre.cadre.length === 0 || filtre.cadre.includes(data.cadre)) &&
      (filtre.asso.length === 0 ||
        filtre.asso.includes(data.association.acronyme)) &&
      (data.nom
        ? data.nom.includes(filtre.sujet)
        : data.sujet.includes(filtre.sujet))
    ) {
      filtre.formateurs.forEach((nomComplet) => {
        checkFormUnit = false;
        data.formateurs.map((formateur) => {
          if (formateur.prenom + " " + formateur.nom === nomComplet) {
            checkFormUnit = true;
          }
        });
        if (!checkFormUnit) {
          checkFormateur = false;
        }
      });

      filtre.domaines.forEach((libelle) => {
        checkDomaineUnit = false;
        data.domaines.map((domaine) => {
          if (domaine.libelle === libelle) {
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

function AccueilAffichage(unFilteredData: formation[], userInfo: UserInfo) {
  unFilteredData.sort((a, b) => {
    if (a.date === undefined) {
      return 1;
    }
    if (b.date === undefined) {
      return 0;
    }
    return a.date > b.date ? 0 : 1;
  });
  const fullFiltre = GetFullFilter(unFilteredData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [liveness, setLiveness] = useState(0);
  const [open, setOpen] = useState(0);

  const [mesDemandesSelect, setMesDemandesSelect] = useState(false);
  const [mesFormationsSelect, setMesFormationsSelect] = useState(false);

  const [sujetFiltre, setSujetFiltre] = useState("");
  const [statutFiltre, setStatutFiltre] = useState([]);
  const [domainesFiltre, setDomainesFiltre] = useState([]);
  const [cadreFiltre, setCadreFiltre] = useState([]);
  const [assoFiltre, setAssoFiltre] = useState([]);
  const [formateursFiltre, setFormateursFiltre] = useState([]);

  const axiosPrivate = useAxiosPrivate();
  const token = decodeToken(localStorage.getItem("accessToken")).decoded;

  let filtre = INITIAL_FILTRE;
  let newfiltre: filtre = filtre;
  let data = Filtres(unFilteredData, filtre);

  function SetFiltre(newfiltre: filtre) {
    filtre = newfiltre;
    data = Filtres(unFilteredData, filtre);
    if (mesDemandesSelect) setMesDemandesSelect(false);
    if (mesFormationsSelect) setMesFormationsSelect(false);
    setLiveness(liveness + 1);
  }

  const domaineLibelleList = (domaines) => {
    let list = [];
    domaines.map((domaine) => {
      list.push(domaine.libelle);
    });
    return list;
  };

  const formateurList = (formateurs) => {
    let list = [];
    formateurs?.map((formateur) => {
      list.push(formateur.prenom + " " + formateur.nom.toUpperCase());
    });
    return list;
  };

  const checkRoleAsso = () => {
    return token.role === "ROLE_ASSO";
  };

  const checkRoleBn = () => {
    return token.role === "ROLE_BN";
  };

  const checkRoleFormateur = () => {
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
  const handleOpen = (id: number) => {
    setOpen(id);
  };
  const handleClose = () => {
    setOpen(0);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSujetFiltre(event.target.value);
    newfiltre.sujet = event.target.value;
    SetFiltre(newfiltre);
  };

  const postAssignFormateur = async (row: formation) => {
    try {
      let affectation = new UtilisateurIdFormationIdApi();
      affectation.idFormation = row.id;
      affectation.idUtilisateur = token.id;
      const response = await FetchAssignFormateur(axiosPrivate, affectation);
      if (response.data.code === 200) {
        unFilteredData[unFilteredData.indexOf(row)] = response.data.formation;
        data = Filtres(unFilteredData, filtre);
        setLiveness(liveness + 1);
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
    handleClose();
  };

  const postLikeFormation = async (row: formation) => {
    try {
      let interesser = new UtilisateurIdFormationIdApi();
      interesser.idFormation = row.id;
      interesser.idUtilisateur = token.id;
      const response = await FetchLikeFormation(axiosPrivate, interesser);
      if (response.data.code === 200) {
        unFilteredData[unFilteredData.indexOf(row)] = response.data.formation;
        data = Filtres(unFilteredData, filtre);
        setLiveness(liveness + 1);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
    handleClose();
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      fontSize: 16,
      backgroundColor: "#f3f3f3",
    },
  }));

  function setPreFiltre(id: number) {
    let prefiltre = INITIAL_FILTRE;
    setAssoFiltre([]);
    setFormateursFiltre([]);
    setCadreFiltre([]);
    setDomainesFiltre([]);
    setStatutFiltre([]);
    setSujetFiltre("");
    prefiltre.asso = [];
    prefiltre.formateurs = [];
    prefiltre.cadre = [];
    prefiltre.domaines = [];
    prefiltre.sujet = "";
    prefiltre.statut = [];
    switch (id) {
      case 1:
        if (!mesDemandesSelect) {
          prefiltre.asso = [userInfo.acronyme];
          setAssoFiltre([userInfo.acronyme]);
          setMesDemandesSelect(true);
        }
        SetFiltre(prefiltre);

        break;
      case 2:
        if (!mesFormationsSelect) {
          prefiltre.formateurs = [userInfo.prenom + " " + userInfo.nom];
          setFormateursFiltre([userInfo.prenom + " " + userInfo.nom]);
          setMesFormationsSelect(true);
        }
        SetFiltre(prefiltre);
        break;
    }
  }

  const StyledToggleButton = (
    text: string,
    selected: boolean,
    id: number,
    hide: boolean
  ) => {
    return (
      <ToggleButton
        color="primary"
        size="small"
        value="check"
        hidden={hide}
        selected={selected}
        onChange={() => {
          setPreFiltre(id);
        }}
      >
        {text}
      </ToggleButton>
    );
  };

  const ADeterminerText = () => {
    return (
      <>
        <span style={{ opacity: 0.5 }}>À déterminer</span>
      </>
    );
  };

  const checkFormateurAttribueAFormation = (formation: formation) => {
    return formation?.formateurs?.some(
      (formateur) => formateur.id === token.id
    );
  };

  const checkFormateurPeutModifierFormation = (formation: formation) => {
    return (
      checkFormateurAttribueAFormation(formation) &&
      statutToString(formation.statut) === Statut.A_VENIR.toString()
    );
  };

  const showLoadingSkeleton = () => {
    let skeltons = [];
    let i = 0;
    for (i; i < rowsPerPage; i++) {
      skeltons.push(
        <TableRow>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
          <TableCell hidden={checkRoleAsso()}>
            <Skeleton sx={{ width: "auto" }} />
          </TableCell>
        </TableRow>
      );
    }
    return skeltons;
  };

  return (
    <>
      <Grid container spacing={2} marginTop={1}>
        <Grid xs={2}>
          <Grid marginLeft={3} marginRight={2}>
            <Typography color="primary" variant="h4">
              Filtres
            </Typography>
            <Stack spacing={1}>
              <Divider />
              {StyledToggleButton(
                "Mes formations",
                mesFormationsSelect,
                2,
                !checkRoleFormateur()
              )}
              {StyledToggleButton(
                "Mes demandes",
                mesDemandesSelect,
                1,
                !checkRoleAsso()
              )}
              <Divider hidden={checkRoleBn()} />
              <Autocomplete
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.statut}
                value={statutFiltre}
                onChange={(event, value) => {
                  setStatutFiltre(value);
                  newfiltre.statut = value;
                  SetFiltre(newfiltre);
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
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.domaines}
                value={domainesFiltre}
                onChange={(event, value) => {
                  setDomainesFiltre(value);
                  newfiltre.domaines = value;
                  SetFiltre(newfiltre);
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
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.cadre}
                value={cadreFiltre}
                onChange={(event, value) => {
                  setCadreFiltre(value);
                  newfiltre.cadre = value;
                  SetFiltre(newfiltre);
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
                value={sujetFiltre}
                onChange={handleChange}
              />

              <Autocomplete
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.asso}
                value={assoFiltre}
                onChange={(event, value) => {
                  setAssoFiltre(value);
                  newfiltre.asso = value;
                  SetFiltre(newfiltre);
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
                hidden={checkRoleAsso()}
                multiple
                id="free-solo-2-demo"
                disableClearable
                options={fullFiltre.formateurs}
                value={formateursFiltre}
                onChange={(event, value) => {
                  setFormateursFiltre(value);
                  newfiltre.formateurs = value;
                  SetFiltre(newfiltre);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Formateurs"
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
        <Grid xs={10}>
          <div className="container-fluid" id="accueil">
            <Typography
              color="primary"
              variant="h4"
              style={{ width: "fit-content" }}
            >
              Formations <Divider style={{ marginBottom: 6 }} />
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <StyledTableCell align="center">Statut</StyledTableCell>
                  <StyledTableCell align="center">Cadre</StyledTableCell>
                  <StyledTableCell align="center">Domaine(s)</StyledTableCell>
                  <StyledTableCell align="center">Titre</StyledTableCell>
                  <StyledTableCell align="center">Association</StyledTableCell>
                  <StyledTableCell align="center" hidden={checkRoleAsso()}>
                    Formateur(s)
                  </StyledTableCell>
                  <StyledTableCell align="center">Date</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableHead>
                <TableBody>
                  {data.length > 0
                    ? data
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row) => (
                          <TableRow key={row.id}>
                            <TableCell
                              align="center"
                              style={{ color: statutToStyle(row.statut) }}
                            >
                              {statutToString(row.statut)}
                            </TableCell>
                            <TableCell align="center">
                              {row.cadre === null
                                ? ADeterminerText()
                                : row.cadre}
                            </TableCell>
                            <TableCell
                              align="center"
                              title={domaineLibelleList(row.domaines).join(
                                ", "
                              )}
                            >
                              {domaineLibelleList(row.domaines).join(", ")
                                .length > 40
                                ? domaineLibelleList(row.domaines)
                                    .join(", ")
                                    .substring(0, 40) + "..."
                                : domaineLibelleList(row.domaines).join(", ")}
                            </TableCell>
                            <TableCell align="center">
                              {row.nom != null ? row.nom : row.sujet}
                            </TableCell>
                            <TableCell
                              align="center"
                              title={row.association.nomComplet}
                            >
                              {row.association.acronyme}
                            </TableCell>
                            <TableCell
                              align="center"
                              hidden={checkRoleAsso()}
                              title={formateurList(row.formateurs).join(", ")}
                            >
                              {row.formateurs.length > 0
                                ? formateurList(row.formateurs).join(", ")
                                    .length > 15
                                  ? formateurList(row.formateurs)
                                      .join(", ")
                                      .substring(0, 15) + "..."
                                  : formateurList(row.formateurs).join(", ")
                                : ADeterminerText()}
                            </TableCell>
                            <TableCell align="center">
                              {row.date === null ? ADeterminerText() : row.date}
                            </TableCell>
                            <TableCell align="center">
                              {checkRoleBn() ||
                              checkFormateurPeutModifierFormation(row) ? (
                                <Link to={"/formation/" + row.id}>
                                  <AiOutlineZoomIn className="Icones me-2" />
                                </Link>
                              ) : (
                                <AiOutlineZoomIn
                                  className="Icones me-2"
                                  onClick={() => handleOpen(row.id)}
                                />
                              )}
                              <Dialog
                                open={open === row.id}
                                onClose={() => handleClose()}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                              >
                                <DialogTitle
                                  id="alert-dialog-title"
                                  color="primary"
                                >
                                  {row?.nom != null ? row?.nom : row?.sujet}
                                </DialogTitle>
                                <DialogContent>
                                  <TableContainer>
                                    <Table>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell
                                            style={{ fontWeight: "bold" }}
                                          >
                                            Statut
                                          </TableCell>
                                          <TableCell
                                            style={{
                                              color: statutToStyle(row?.statut),
                                            }}
                                          >
                                            {" "}
                                            {statutToString(row?.statut)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell
                                            style={{ fontWeight: "bold" }}
                                          >
                                            Cadre
                                          </TableCell>
                                          <TableCell>
                                            {" "}
                                            {row?.cadre === null
                                              ? ADeterminerText()
                                              : row?.cadre}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell
                                            style={{ fontWeight: "bold" }}
                                          >
                                            Date
                                          </TableCell>
                                          <TableCell>{row?.date}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell
                                            style={{ fontWeight: "bold" }}
                                          >
                                            Domaine(s)
                                          </TableCell>
                                          <TableCell>
                                            {domaineLibelleList(
                                              row?.domaines
                                            ).join(", ")}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell
                                            style={{ fontWeight: "bold" }}
                                          >
                                            Association
                                          </TableCell>
                                          <TableCell>
                                            {row?.association?.nomComplet}
                                          </TableCell>
                                        </TableRow>
                                        {!checkRoleAsso() ? (
                                          <TableRow>
                                            <TableCell
                                              style={{ fontWeight: "bold" }}
                                            >
                                              Formateurs
                                            </TableCell>
                                            <TableCell>
                                              {formateurList(
                                                row?.formateurs
                                              ).join(", ")}
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          <></>
                                        )}
                                        <TableRow>
                                          <TableCell
                                            style={{ fontWeight: "bold" }}
                                          >
                                            Détails de la demande
                                          </TableCell>
                                          <TableCell>{row?.detail}</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </DialogContent>
                                <DialogActions>
                                  {!checkRoleAsso() ? (
                                    row?.formateurs?.some(
                                      (formateur) => formateur.id === token.id
                                    ) ? (
                                      <Button
                                        onClick={() => postAssignFormateur(row)}
                                        hidden={
                                          statutToString(row?.statut) !==
                                          "À attribuer"
                                        }
                                        color="warning"
                                      >
                                        Se retirer de la formation
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() => postAssignFormateur(row)}
                                        hidden={
                                          statutToString(row?.statut) !==
                                          "À attribuer"
                                        }
                                      >
                                        S'affecter à la formation
                                      </Button>
                                    )
                                  ) : (
                                    <></>
                                  )}
                                  <Button onClick={() => handleClose()}>
                                    Fermer
                                  </Button>
                                </DialogActions>
                              </Dialog>
                              {checkRoleAsso() &&
                              row.association.id !== token.id &&
                              statutToString(row?.statut) !== "Passée" ? (
                                <Button
                                  sx={{
                                    padding: 0,
                                    minWidth: "24px",
                                    maxWidth: "24px",
                                  }}
                                  onClick={() => postLikeFormation(row)}
                                >
                                  {row?.associationsFavorables?.some(
                                    (association) => association.id === token.id
                                  ) ? (
                                    <FavoriteOutlinedIcon />
                                  ) : (
                                    <FavoriteBorderOutlinedIcon />
                                  )}
                                </Button>
                              ) : checkRoleBn() ||
                                checkFormateurPeutModifierFormation(row) ? (
                                <Link to={"/formation/edit/" + row.id}>
                                  <AiOutlineEdit className="Icones me-2" />
                                </Link>
                              ) : (
                                <></>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    : showLoadingSkeleton()}
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

export default AccueilAffichage;
