'use client';

import { Button, Group, Menu, Progress, ScrollArea, Table, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { range } from '@mantine/hooks';
import CircleCheck from '@/components/Icon/CircleCheck';
import CircleX from '@/components/Icon/CircleX';

function randomString(length: number) {
    const chars = '1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm';
    let result = '';
    range(0, length).forEach(() => {
        result += chars[Math.floor(Math.random() * chars.length)];
    });
    return result;
}

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
    if (props.file === '') {
        return <></>;
    }
    const [size, setSize] = useState(0);
    const [hash, setHash] = useState('Loading...');
    const [progress, setProgress] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);
    const fileName = props.file.split('/').pop();

    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [id] = useState(randomString(6));
    const progressEventName = `progress-${id}`;
    const finishEventName = `finish-${id}`;

    listen(finishEventName, (event) => {
        if (event.event === finishEventName) {
            setHash(event.payload as string);
            setFinished(true);
            props.onComplete(event.payload as string);
        }
    }).then(() => {
    });

    invoke('get_file_size', { file: props.file })
        .then((value) => {
            setSize(value as number);
            if (!started) {
                console.log(props.file, fileName);
                setStarted(true);
                invoke('sum_md5', {
                    name: props.file,
                    event: id,
                }).then(() => {
                });

                listen(progressEventName, (event) => {
                    if (event.event === progressEventName) {
                        const progress_new = event.payload as number;
                        if (progress_new !== 0 && !finished) {
                            setProgress(progress_new);
                            // @ts-ignore
                            setProgressPercent((progress_new / value as number) * 100);
                        }
                    }
                }).then(() => {
                });
            }
        });

    function unmount() {
        console.log('unmount');
        invoke('stop_sum', { event: id }).then(() => {});
    }
    useEffect(() => () => unmount(), []);

    return (
        <Table.Tr key={props.file}>
            <Table.Td>
                <Menu>
                    <Menu.Target>
                        <ScrollArea maw={300}>
                            <Button variant="transparent">{fileName}</Button>
                        </ScrollArea>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                          onClick={props.onDelete}
                          color="red">Remove this file from list
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
            <Table.Td> {size === 0 ? 'Loading' : getProperSizePrompt(size)} </Table.Td>
            <Table.Td>
                <Progress size="xl" value={finished ? 100 : progressPercent} />
            </Table.Td>
            <Table.Td>
                <ScrollArea w={finished ? 100 : 220}>
                    <Group>
                        {finished ? 'Finished' :
                            <Text>
                                {progressPercent.toFixed(0)}%
                                ({getProperSizePrompt(progress)}/{getProperSizePrompt(size)})
                            </Text>
                        }
                        {props.importedHash !== undefined && finished &&
                            <Text c={props.importedHash === hash ? 'green' : 'red'}>
                                {props.importedHash === hash ?
                                    <CircleCheck /> : <CircleX />}
                            </Text>
                        }
                    </Group>
                </ScrollArea>
            </Table.Td>
            <Table.Td> {hash} </Table.Td>
            <Table.Td>
                {props.importedHash === undefined ? '' : props.importedHash}
            </Table.Td>
        </Table.Tr>
    );
}

export interface FileRowProps {
    file: string,
    checkMode: boolean,
    importedHash: string | undefined,
    onDelete: () => void,
    onComplete: (hash: string) => void,
}
