'use client';

import {Button, Center, Group, Space, Stack, Table, ScrollArea, Box, Menu, Text} from '@mantine/core';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import FileRow from '@/components/FileRow/FileRow';
import FilePlus from '@/components/Icon/FilePlus';
import FileExport from '@/components/Icon/FileExport';
import FileImport from '@/components/Icon/FileImport';
import FilesIcon from '@/components/Icon/FilesIcon';
import HashTypeSelector, { HashType } from '@/components/HashTypeSelector/HashTypeSelector';

export default function HomePage() {
    const [files, setFiles] = useState<string[]>([]);
    const [hash, setHash] = useState(new Map());
    const [importHashMap, setImportHashMap] = useState(new Map());
    const [hashType, setHashType] = useState(HashType.MD5);

    async function selectFile() {
        invoke('get_md5_list').then((currentFileImported) => {
            console.log(currentFileImported);
            const currentFile = currentFileImported as string[][];
            const newHashMap = importHashMap;
            const newFiles = [...files];
            for (const [fileMD5, filePath] of currentFile) {
                newFiles.push(filePath);
                newHashMap.set(filePath, fileMD5);
            }
            console.log(newFiles, newHashMap);

            setImportHashMap(newHashMap);
            setFiles(newFiles);
        });
    }

    async function addNewFile() {
        invoke('get_new_file').then((res) => {
            const newFiles = res as string[];
            const newFile = [...files];
            for (const fileElement of newFiles) {
                if (!files.includes(fileElement)) {
                    newFile.push(fileElement);
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
                        <Menu>
                            <Menu.Target>
                                <Button leftSection={<FilesIcon />}>Files</Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Action</Menu.Label>
                                <Menu.Item onClick={addNewFile} leftSection={<FilePlus />}>
                                    Add single file
                                </Menu.Item>
                                <Menu.Item onClick={selectFile} leftSection={<FileImport />}>
                                    Import hash list
                                </Menu.Item>
                                <Menu.Item onClick={exportHash} leftSection={<FileExport />}>
                                    Export hash list
                                </Menu.Item>
                                {files.length > 0 &&
                                    <>
                                        <Menu.Divider />
                                        <Menu.Label>Danger Zone</Menu.Label>
                                        <Menu.Item
                                          color="red"
                                          onClick={() => {
                                                setFiles([]);
                                                setHash(new Map());
                                                setImportHashMap(new Map());
                                            }}> Clear
                                        </Menu.Item>
                                    </>
                                }
                            </Menu.Dropdown>
                        </Menu>

                        <HashTypeSelector onSelect={setHashType} />
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
                                    <Table.Th>Recorded</Table.Th>
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
