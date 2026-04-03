import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    min-height: 140px;
    background-color: #ffffff05;
    border: 1px solid #ffffff14;
    border-radius: 12px;
    box-shadow: 0 10px 24px #00000025;
    padding: 12px 14px;
    display: flex;
    gap: 12px;
    flex-direction: row;
    @media (max-width: 530px) {
        flex-direction: column;
    }
    transition: transform 0.2s ease;
    &:hover { transform: translateY(-1px); }
`
const Image = styled.img`
    width: 92px;
    height: 92px;
    @media (max-width: 530px) {
      width: 100%;
      height: 140px;
    }
    object-fit: cover;
    ${({ theme, prediction }) =>  prediction ? `border: 1px solid ${theme.green}` : `border: 1px solid ${theme.pink}` };
    border-radius: 10px;
`

const ImageWrap = styled.div`
    position: relative;
    width: 92px;
    height: 92px;
    @media (max-width: 530px) {
      width: 100%;
      height: 140px;
    }
`;

const TumorBox = styled.div`
    position: absolute;
    border: 2px solid #22c55e;
    border-radius: 4px;
    box-shadow: 0 0 0 2px #22c55e33;
    pointer-events: none;
`;

const TumorBadge = styled.div`
    position: absolute;
    top: 6px;
    left: 6px;
    background: #22c55e;
    color: #0b1220;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 999px;
    letter-spacing: 0.2px;
`;
const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
`
const Title = styled.div`
    font-size: 20px;
    font-weight: 700;
    ${({ theme, prediction }) =>  prediction ? `color: ${theme.green+'dd'}` : `color: ${theme.pink+'dd'}` };
`

const Description = styled.div`
    font-size: 13px;
    line-height: 1.35;
    font-weight: 400;
    ${({ theme, prediction }) =>  prediction ? `color: ${theme.green+'aa'}` : `color: ${theme.pink+'aa'}` };
`
const File = styled.div`
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.textSoft};
`
const Probablity = styled.div`
    font-size: 15px;
    font-weight: 600;
    margin-top: 4px;
    ${({ theme, prediction }) =>  prediction ? `color: ${theme.green+'ee'}` : `color: ${theme.pink+'ee'}` };
`;

const ConfidenceBreakdown = styled.div`
    font-size: 13px;
    color: ${({ theme }) => theme.textSoft};
    display: flex;
    gap: 12px;
    margin-top: 2px;
`;

const Note = styled.div`
    font-size: 11px;
    color: ${({ theme }) => theme.textSoft + "cc"};
    margin-top: 3px;
`;


const ResultCard = ({image,prediction,box}) => {
    const tumorConfidence = Math.max(0, Math.min(100, prediction * 100));
    const noTumorConfidence = 100 - tumorConfidence;
    const hasTumor = tumorConfidence >= 50;

    const displayConfidence = hasTumor ? tumorConfidence : noTumorConfidence;

    return (
        <Container>
            <ImageWrap>
                <Image prediction={!hasTumor} src={image.base64_file} alt={image.file_name} />
                {hasTumor && box && (
                    <>
                        <TumorBadge>Tumor region</TumorBadge>
                        <TumorBox
                            style={{
                                left: `${box.x * 100}%`,
                                top: `${box.y * 100}%`,
                                width: `${box.w * 100}%`,
                                height: `${box.h * 100}%`,
                            }}
                        />
                    </>
                )}
            </ImageWrap>
            <Body>
                <Title prediction={!hasTumor}>{!hasTumor ? "No Tumor Detected" : "Tumor Detected"}</Title>
                <Description  prediction={!hasTumor}>{!hasTumor ? "Model confidence indicates no tumor is detected in this image." : "Model confidence indicates a tumor is detected in this image." }</Description>
                <File>File: {image.file_name}</File>
                <Probablity  prediction={!hasTumor}>Confidence: {Math.round(displayConfidence * 100) / 100}%</Probablity>
                <ConfidenceBreakdown>
                    <span>Tumor: {Math.round(tumorConfidence * 100) / 100}%</span>
                    <span>No Tumor: {Math.round(noTumorConfidence * 100) / 100}%</span>
                </ConfidenceBreakdown>
                <Note>Confidence score is not the same as clinical accuracy.</Note>
            </Body>
        </Container>
    )
}

export default ResultCard