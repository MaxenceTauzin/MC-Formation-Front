import * as React from 'react';
import {styled} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Container} from '@mui/material';
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const InformationsGeneralesFormationV2 = (formation) => {


    let myPaddingStyle = {
        paddingLeft: 10,
        paddingBottom: 10,
    }
    let Donnee = formation.formation;
    const AfficherDataInfoGenerales = () => {
        console.log(Donnee);
        return (
            <>
                <StyledTableRow style={myPaddingStyle}>
                    <StyledTableHead>Statut</StyledTableHead>
                    <StyledTableCell>{Donnee.statut}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                    <StyledTableHead>Cadre</StyledTableHead>
                    <StyledTableCell>{Donnee.cadre}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                    <StyledTableHead sx={{p:1}}>Type</StyledTableHead>
                    <StyledTableCell>{Donnee.type}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                    <StyledTableHead>Date</StyledTableHead>
                    <StyledTableCell>{Donnee.date}</StyledTableCell>
                </StyledTableRow>
            </>
        )
    }
    const AfficherDataDomaine = () => Donnee.domaines.map(
        (info) => {
            return (
                <StyledTableRow key={info.code} title={info.description}>
                    <StyledTableCell>{info.code}</StyledTableCell>
                    <StyledTableCell>{info.libelle}</StyledTableCell>
                </StyledTableRow>
            )
        }
    )
    const AfficherDataFormateur = () => Donnee.formateurs.map(
        (info) => {
            return (
                <StyledTableRow key={info.id}>
                    <StyledTableCell>{info.nom}</StyledTableCell>
                    <StyledTableCell>{info.prenom}</StyledTableCell>
                </StyledTableRow>
            )
        }
    )
    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({theme}) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const StyledTableHead = styled(TableHead)(({theme}) => ({
        '&:nth-of-type(odd)': {
            fontWeight: "bold",
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    let dense;
    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
            <TableContainer component={Paper}   sx={{maxHeight: 250}}>
                <Typography
                    sx={{ flex: '1 1 100%', p:1 }}
                    variant="h5"
                    color="primary"
                    id="tableTitle"
                    component="div"> Informations Générales
                </Typography>
                <Table sx={{minWidth: 100}} aria-label="customized table">
                    <TableBody>
                        {AfficherDataInfoGenerales()}
                    </TableBody>
                </Table>
            </TableContainer>
            </Grid>
            <Grid item xs={6}>

                <TableContainer component={Paper}  sx={{maxHeight: 250}}>
                    <Typography
                        sx={{ flex: '1 1 100%', p:1}}
                        variant="h5"
                        color="primary"
                        id="tableTitle"
                        component="div">Domaine(s)

                    </Typography>
                    <Table stickyHeader aria-label="customized table">
                        <StyledTableHead>
                            <StyledTableRow>
                                <StyledTableCell>Code</StyledTableCell>
                                <StyledTableCell>Nom</StyledTableCell>
                            </StyledTableRow>
                        </StyledTableHead>
                        <TableBody>
                            {AfficherDataDomaine()}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={6}>
                <TableContainer component={Paper} sx={{maxHeight: 250}}>
                    <Typography
                        sx={{ flex: '1 1 100%' , p:1}}
                        variant="h5"
                        color="primary"
                        id="tableTitle"
                        component="div">Formateur(s)</Typography>
                    <Table sx={{minWidth: 100}} aria-label="customized table">
                        <StyledTableHead>
                            <StyledTableRow>
                                <StyledTableCell>Nom</StyledTableCell>
                                <StyledTableCell>Prenom</StyledTableCell>
                            </StyledTableRow>
                        </StyledTableHead>
                        <TableBody>
                            {AfficherDataFormateur()}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={6}>
                <TableContainer component={Paper}   sx={{maxHeight: 250}}>
                    <Typography
                        sx={{ flex: '1 1 100%', p:1 }}
                        variant="h5"
                        id="tableTitle"
                        color="primary"
                        component="div">Association(s) intéréssée(s)</Typography>
                    <Table sx={{minWidth: 100}} aria-label="customized table">
                        <StyledTableHead>
                            <StyledTableRow>
                                <StyledTableCell>Nom</StyledTableCell>
                                <StyledTableCell>Ville</StyledTableCell>
                            </StyledTableRow>
                        </StyledTableHead>
                        <TableBody>

                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}
export default InformationsGeneralesFormationV2;