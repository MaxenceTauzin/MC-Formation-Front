import React from 'react';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import {styled} from '@mui/material/styles';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Partie from '../../../api/model/Partie';
import Typography from '@mui/material/Typography';

const FilConducteurFormation = (props) => {

    let parties: Partie[] = props.formation.parties;

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
            fontWeight: 'bold',
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const AfficherDataFilConducteur =
        parties?.length > 0 ?
            parties?.map(
                (partie) => {
                    return (
                        <StyledTableRow key={partie.id}>
                            <StyledTableCell width={200}>{partie.plan}</StyledTableCell>
                            <StyledTableCell width={100}>{partie.timing} min</StyledTableCell>
                            <StyledTableCell>{partie.contenu}</StyledTableCell>
                            <StyledTableCell width={300}>{partie.methodologie}</StyledTableCell>
                        </StyledTableRow>
                    )
                }
            ) : <StyledTableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
            </StyledTableRow>

    return (
        <Grid>
            <Typography
                sx={{flex: '1 1 100%', p: 1}}
                variant="h5"
                color="primary"
                id="tableTitle"
                component="div">
                Fil conducteur
            </Typography>
            <TableContainer component={Paper}>
                <Table stickyHeader sx={{minWidth: 100}} aria-label="customized table">
                    <StyledTableHead>
                        <StyledTableRow>
                            <StyledTableCell>Plan/Partie</StyledTableCell>
                            <StyledTableCell>Timing</StyledTableCell>
                            <StyledTableCell>Contenu</StyledTableCell>
                            <StyledTableCell>Méthodologie pédagogique</StyledTableCell>
                        </StyledTableRow>
                    </StyledTableHead>
                    <TableBody>
                        {AfficherDataFilConducteur}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}

export default FilConducteurFormation;
