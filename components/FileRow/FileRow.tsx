'use client';

import { Button, Group, Menu, Progress, Table, Text } from '@mantine/core';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

function getProperSizePrompt(size: number): string {
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    }
    if (size < 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function FileRow(props: FileRowProps) {
    const [size, setSize] = useState(0);
    const [hash, setHash] = useState('Loading...');
    const [progress, setProgress] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);
    const fileName = props.file.split('/').pop();

    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const eventName = `progress-${fileName.replace(/[|&;$%@"<>()+,.]/g, '')}`;

    invoke('get_file_size', { file: props.file })
        .then((value) => {
            setSize(value as number);
            if (!started) {
                console.log(props.file, fileName);
                setStarted(true);
                invoke('sum_md5', { name: props.file }).then((r) => {
                    setHash(r as string);
                    setFinished(true);
                });

                listen(eventName, (event) => {
                    if (event.event === eventName) {
                        const progress_new = event.payload as number;
                        if (progress_new !== 0 && !finished) {
                            setProgress(progress_new);
                            setProgressPercent((progress_new / value as number) * 100);
                        }
                    }
                }).then(() => { console.log('Listening to', eventName); });
            }
        });

    return (
        <Table.Tr>
            <Table.Td>
                <Menu>
                    <Menu.Target>
                        <Button variant="transparent">{fileName}</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={props.onDelete} color="red">Remove this file from list</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
            <Table.Td> {size === 0 ? 'Loading' : getProperSizePrompt(size)} </Table.Td>
            <Table.Td>
                <Progress size="xl" value={progressPercent} />
            </Table.Td>
            <Table.Td>
                {finished ? 'Finished' :
                    <Text>
                        {progressPercent.toFixed(0)}%
                        ({getProperSizePrompt(progress)}/{getProperSizePrompt(size)})
                    </Text>
                }
            </Table.Td>
            <Table.Td> {hash} </Table.Td>
            <Table.Td>{eventName}</Table.Td>
        </Table.Tr>
    );
}

export interface FileRowProps {
    file: string,
    checkMode: boolean,
    onDelete: () => void,
}