'use client';

import { Button, Center, Group, Space, Stack, Table, ScrollArea, Box } from '@mantine/core';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import FileRow from '@/components/FileRow/FileRow';
import FilePlus from '@/components/Icon/FilePlus';
import FileExport from '@/components/Icon/FileExport';
import FileImport from '@/components/Icon/FileImport';

export default function HomePage() {
    const [files, setFiles] = useState<string[]>([]);
    const [checkMode, setCheckMode] = useState(true);
    const [hash, setHash] = useState(new Map());
    const [importHashMap, setImportHashMap] = useState(new Map());

    async function selectFile() {
        invoke('get_md5_list').then((res) => {
            setFiles([]);
            setCheckMode(true);
        });
    }

    async function addNewFile() {
        invoke('get_new_file').then((res) => {
            const newFiles = res as string[];
            const newFile = [...files];
            for (const file of newFiles) {
                if (!files.includes(file)) {
                    newFile.push(file);
                }
            }
            setFiles(newFile);
        });
    }

    async function exportHash() {
        const exportHashes = files.map((e) => [e, hash.get(e) as string]);
        invoke('export', { files: exportHashes }).then(() => {});
    }

    return (
        <>
            <Stack>
                <Space />
                <Center>
                    <Group>
                        <Button onClick={addNewFile} leftSection={<FilePlus />}>Add new file</Button>
                        <Button onClick={selectFile} leftSection={<FileImport />}>Import file</Button>
                        <Button onClick={exportHash} leftSection={<FileExport />}>Export</Button>

                        {files.length !== 0 &&
                            <Button
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                  setFiles([]);
                                  setHash(new Map());
                                }}>Clear
                            </Button>}
                    </Group>
                </Center>

                <ScrollArea w="100%" offsetScrollbars>
                    <Box w={1200}>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>File Name</Table.Th>
                                    <Table.Th>Size</Table.Th>
                                    <Table.Th>Progress</Table.Th>
                                    <Table.Th></Table.Th>
                                    <Table.Th>Hash</Table.Th>
                                    <Table.Th>Id</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {files.map((file: string, index: number) =>
                                    <FileRow
                                      checkMode
                                      file={file}
                                      importedHash={importHashMap.get(file)}
                                      onDelete={() => {
                                          const deleted_file = [...files];
                                            deleted_file[index] = '';
                                            setFiles(deleted_file);
                                        }}
                                      onComplete={(fileHash) => {
                                          const newHash = hash;
                                          newHash.set(file, fileHash);
                                          setHash(newHash);
                                    }} />)}
                            </Table.Tbody>
                        </Table>
                    </Box>
                </ScrollArea>
            </Stack>
        </>
    );
}
