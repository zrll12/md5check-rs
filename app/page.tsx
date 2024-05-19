'use client';

import { Button, Center, Group, Space, Stack, Table, ScrollArea, Box } from '@mantine/core';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import FileRow from '@/components/FileRow/FileRow';

export default function HomePage() {
    const [md5file, setMD5File] = useState('');
    const [files, setFiles] = useState<string[]>([]);
    const [checkMode, setCheckMode] = useState(true);

    async function selectFile() {
        invoke('get_md5_list').then((res) => {
            setFiles([]);
            setMD5File(res as string);
            setCheckMode(true);
        });
    }

    async function addNewFile() {
        invoke('get_new_file').then((res) => {
            const newFiles = [...files];
            newFiles.push(res as string);
            // newFiles.sort();
            setFiles(newFiles);
        });
    }

    return (
        <>
            <Stack>
                <Space />
                <Center>
                    <Group>
                        <Button onClick={selectFile}>{md5file === '' ? 'Open file' : `MD5 file: ${md5file}`}</Button>
                        {md5file !== '' &&
                            <Button
                              variant="subtle"
                              onClick={() => {
                                    setMD5File('');
                                    setCheckMode(false);
                                }}>Close File
                            </Button>}
                        {md5file === '' &&
                            <Button variant="light" onClick={addNewFile}>Add new file</Button>}
                    </Group>
                </Center>

                <ScrollArea w={800}>
                    <Box w={1200}>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>File Name</Table.Th>
                                    <Table.Th>Size</Table.Th>
                                    <Table.Th>Progress</Table.Th>
                                    <Table.Th></Table.Th>
                                    <Table.Th>Hash</Table.Th>
                                    <Table.Th>Record</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {files.map((file, index) =>
                                    <FileRow
                                      checkMode
                                      file={file}
                                      onDelete={() => {
                                            const deleted_file = [...files];
                                            deleted_file.splice(index, 1);
                                            setFiles(deleted_file);
                                        }} />)}
                            </Table.Tbody>
                        </Table>
                    </Box>
                </ScrollArea>
            </Stack>
        </>
    );
}
