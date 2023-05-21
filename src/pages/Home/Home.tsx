import React, { useEffect, useState } from 'react';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import './Home.css';
import { addDays } from 'date-fns';
import { orderBy, startCase } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import rutina from './routine.json';
import { Routine } from '../../models/routine';
import { YoutubePlayer } from 'capacitor-youtube-player';
import { useGetLanguageCode } from '@capacitor-community/device-react';

const Home: React.FC = () => {
    const [day, setDay] = useState();
    const { languageCode } = useGetLanguageCode();

    const { data } = useQuery({
        queryKey: ['rutina', day, rutina],
        queryFn: () =>
            orderBy(
                (rutina as Routine[]).filter((r) => r.day === day),
                ['order'],
            ),
    });

    const getWeekDays = () => {
        const baseDate = new Date(Date.UTC(2017, 0, 2));
        return Array.from(Array(7).keys()).map((d) =>
            startCase(
                addDays(baseDate, d).toLocaleDateString(languageCode, {
                    weekday: 'long',
                }),
            ),
        );
    };

    const weekDays = getWeekDays();

    useEffect(() => {
        async function initializeYoutubePlayerPluginWeb(video: string) {
            const options = {
                playerId: 'youtube-player',
                playerSize: { width: 640, height: 360 },
                videoId: video,
                debug: true,
            };
            YoutubePlayer.initialize(options).then((res) => {
                if (res?.playerReady) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const v: any = document.getElementById('youtube-player');
                    if (v) {
                        v.style = 'width: 100%; heigth: 100%';
                    }
                }
            });
        }
        initializeYoutubePlayerPluginWeb('');
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        <IonSelect
                            interface="popover"
                            placeholder="Select a day"
                            onIonChange={(e) => setDay(e.target.value)}
                        >
                            {weekDays?.map((w, i) => (
                                <IonSelectOption key={i} value={i}>
                                    {w}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid>
                    {data && data?.length > 0 && (
                        <IonRow class="headers ion-align-items-center">
                            <IonCol>
                                <IonText color="primary">
                                    <h5>Exercise</h5>
                                </IonText>
                            </IonCol>
                            <IonCol>
                                <IonText color="primary">
                                    <h5>Repetitions</h5>
                                </IonText>
                            </IonCol>
                            <IonCol>
                                <IonText color="primary">
                                    <h5>Remarks</h5>
                                </IonText>
                            </IonCol>
                        </IonRow>
                    )}
                    {data?.map((r) => (
                        <IonRow key={r.order} class="ion-align-items-center">
                            <IonCol>
                                <IonButton
                                    fill="clear"
                                    onClick={() => {
                                        if (r.videos && r.videos.length > 0) {
                                            YoutubePlayer.cueVideoById(
                                                'youtube-player',
                                                { videoId: r.videos[0] },
                                            );
                                        }
                                    }}
                                >
                                    {r.exercise}
                                </IonButton>
                            </IonCol>
                            <IonCol>{r.repetitions}</IonCol>
                            <IonCol>{r.remarks}</IonCol>
                        </IonRow>
                    ))}
                </IonGrid>
                <IonCard>
                    <IonCardContent id="youtube-player" />
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Home;
