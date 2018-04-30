import * as React from "react";
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import TextField from 'material-ui/TextField';


class Editor extends React.Component<undefined, EditorState>
{
    constructor() {
        super(undefined);
        this.getTrees = this.getTrees.bind(this);
        this.state = { trees: {} }
        this.getTable = this.getTable.bind(this);
    }

    getTrees() {
        var data = null;
        let context = this;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                context.setState({ trees: JSON.parse(this.responseText) });
            }
        });

        xhr.open("GET", "/trees");
        xhr.setRequestHeader("authorization", localStorage['token']);
        xhr.send(data);
    }

    getTable(obj: any, botName: string) {

        let context = this;
        let rows = []

        for (let intent in obj['intents']) 
        {
            let value = obj['intents'][intent]['response']['value'];
            let type = obj['intents'][intent]['response']['type'];
            let columns = obj['intents'][intent]['response']['columns'];
            let filter = obj['intents'][intent]['response']['filter'];
            let table = obj['intents'][intent]['response']['table'];
            
            let textStyle = {
                margin: 5,
                width: 75,
                fontSize: 15
            }

            let rowId = botName + intent;

            let clickListener = function() {
                context.setState((prevState: any) => {
                    let bot = prevState.trees[botName];
                    let newVal: any = document.getElementById(rowId + 'Value');
                    let newType: any = document.getElementById(rowId + 'Type');
                    let newColumns: any = document.getElementById(rowId + 'Columns');
                    let newFilter: any = document.getElementById(rowId + 'Filter');
                    let newTable: any = document.getElementById(rowId + 'Table');

                    bot['intents'][intent]['response']['value'] = newVal.value;
                    bot['intents'][intent]['response']['type'] = newType.value;
                    bot['intents'][intent]['response']['columns'] = newColumns.value.split(',');
                    bot['intents'][intent]['response']['filter'] = (newFilter.value + '').length > 0 ? newFilter.value.split(',') : [];
                    bot['intents'][intent]['response']['table'] = newTable.value;

                    prevState.trees[botName] = bot;

                    return prevState;
                });
            }

            let saveButton = <FlatButton label = "Save" onClick = {clickListener} secondary = {true}/>;


            rows.push(
                <TableRow key={botName + intent} selectable={false}>
                    <TableRowColumn><TextField multiLine={true} style = {textStyle}
                        id={rowId + 'Intent'}
                        defaultValue={intent}
                        disabled={true}
                    /></TableRowColumn>
                    <TableRowColumn ><TextField multiLine={true} style = {textStyle}
                        id={rowId + 'Value'}
                        defaultValue={value}
                    /></TableRowColumn>
                    <TableRowColumn>
                    <TextField multiLine={true} style = {textStyle}
                        id={rowId + 'Type'}
                        defaultValue={type}
                    />
                    </TableRowColumn>
                    <TableRowColumn>
                    <TextField multiLine={true} style = {textStyle}
                        id={rowId + 'Columns'}
                        defaultValue={columns}
                    /></TableRowColumn>
                    <TableRowColumn >
                    <TextField multiLine={true} style = {textStyle}
                        id={rowId + 'Filter'}
                        defaultValue={filter}
                    />
                    </TableRowColumn>
                    <TableRowColumn >
                    <TextField multiLine={true} style = {textStyle}
                        id={rowId + 'Table'}
                        defaultValue={table}
                    />
                    </TableRowColumn>
                    <TableRowColumn>{saveButton}</TableRowColumn>
                </TableRow>
            );
        }

        return <Table height="200px">
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                    <TableHeaderColumn tooltip="Intent Name">Intent</TableHeaderColumn>
                    <TableHeaderColumn tooltip="Response for this intent">Text Response</TableHeaderColumn>
                    <TableHeaderColumn tooltip="Response Type">Type</TableHeaderColumn>
                    <TableHeaderColumn tooltip="Parameters to show">Columns</TableHeaderColumn>
                    <TableHeaderColumn tooltip="Filter to apply">Filter</TableHeaderColumn>
                    <TableHeaderColumn tooltip="Name of the table associated">Table Name</TableHeaderColumn>
                    <TableHeaderColumn tooltip="Save">Save</TableHeaderColumn>
                </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
                {rows}
            </TableBody>
        </Table>
    }

    componentDidMount() {
        this.getTrees();
    }

    render() {
        let cards = []
        let context = this;

        for (let key in this.state.trees) 
        {
            let clickListener = function() {
                var data = JSON.stringify({
                    "bot": key,
                    "tree": JSON.stringify(context.state.trees[key], null, '\t')
                  });
                  
                  var xhr = new XMLHttpRequest();
                  xhr.withCredentials = true;
                  
                  xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                      console.log(this.responseText);
                    }
                  });
                  
                  xhr.open("PUT", "/tree/restart");
                  xhr.setRequestHeader("authorization", localStorage['token']);
                  xhr.setRequestHeader("content-type", "application/json");
                  xhr.send(data);
            }

            let table = this.getTable(this.state.trees[key], key);
            let card = <Card style={{ margin: 20, width: "90%" }} key={key}>
                <CardHeader
                    title={"Bot called: " + key}
                />
                <CardText>
                    {table}
                </CardText>
                <CardActions>
                <FlatButton label = "Save and Restart" onClick = {clickListener} primary = {true}/>
                </CardActions>
            </Card>
            cards.push(card);
        }

        return <div>{cards}</div>
    }
}

interface EditorState {
    trees: any;
}

export default Editor;