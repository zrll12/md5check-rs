import { useState } from 'react';
import { FloatingIndicator, UnstyledButton } from '@mantine/core';
import classes from './HashTypeSelector.module.css';
import {number} from "prop-types";

export default function HashTypeSelector(props: HashTypeSelectProps) {
    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
    const [active, setActive] = useState(0);

    const data = ['md5', 'blake3'];

    const setControlRef = (index: number) => (node: HTMLButtonElement) => {
        controlsRefs[index] = node;
        setControlsRefs(controlsRefs);
    };

    function updateActive(index: number) {
        props.onSelect(index);
        setActive(index);
    }

    const controls = data.map((item, index) => (
        <UnstyledButton
          key={item}
          className={classes.control}
          ref={setControlRef(index)}
          onClick={() => updateActive(index)}
          mod={{ active: active === index }}
        >
            <span className={classes.controlLabel}>{item}</span>
        </UnstyledButton>
    ));

    return (
        <div className={classes.root} ref={setRootRef}>
            {controls}
            <FloatingIndicator
              target={controlsRefs[active]}
              parent={rootRef}
              className={classes.indicator}
            />
        </div>
    );
}

export enum HashType {
    MD5,
    BLAKE3,
}

export interface HashTypeSelectProps {
    onSelect: (newType: HashType) => void,
}
