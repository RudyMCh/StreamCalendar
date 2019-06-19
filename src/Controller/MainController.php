<?php
namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\User;
use App\Entity\Event;
use \DateTime;
use App\Service\Recaptcha;
use App\Repository\UserRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use \Swift_Mailer;
use \Swift_Message;
use App\Form\RegisterType;

class MainController extends AbstractController{
    /**
     * @Route("/", name="home")
     * Page
     */
    public function home(){

        $title = $this->getParameter('site_title');
;
        return $this->render('index.html.twig', array('title' => $title));
    }
    /**
     * @Route("/mon-calendrier/", name="myCalendar")
     */
    public function myCalendar()
    {
        return $this->render("myCalendar.html.twig");
    }

    /**
     * @Route("/se-connecter/", name="login")
     */
    public function login(){
        return $this->render("login.html.twig");
    }

    /**
     * @Route("/extraction", name="extract")
     */
    public function extract()
    {
        $um = $this->getDoctrine()->getRepository(User::class);
        $user = $um->findOneById(1);
        $eventRepository = $this->getDoctrine()->getRepository(Event::class);
        $events = $eventRepository->findByStreamer(2);
        foreach($events as $event){
            $eventsArray[] = [
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'description' => $event->getDescription(),
                'start' => $event->getStart()->format('Y-m-d H:i:s'),
                'end' => $event->getEnd()->format('Y-m-d H:i:s'),
                'streamer' => $event->getStreamer()->getId()
            ];
        }
        dump($events);
        return $this->json($eventsArray);
    }
    
    /**
     * @Route("/insertion", name="insert")
     */
    public function insert(Request $request)
    {
        if($request->isMethod('post')){
            $title = $request->request->get('title');
            $start = $request->request->get('start');
            $end = $request->request->get('end');
            $description = $request->request->get('description');
            dump($start);
            dump($end);
            dump($title);
            dump($description);
            if(!preg_match('#^.{1,50}$#i',$title)){
                $errors['title']= true;
            }
            if(!preg_match('#^.{0,1000}$#i', $description)){
                $errors['description']= true;
            }
            if(!preg_match('#^.{1,200}$#', $start)){
                $errors['start']= true;   
                $errors['startinfo']= $start;   
            }
            if(!preg_match('#^.{1,200}$#', $end)){
                $errors['end']= true;   
            }
            if(!isset($errors)){
                $um = $this->getDoctrine()->getRepository(User::class);
                $user = $um->findOneById(2);
                $event = new Event;
                $startD = new DateTime($start);
                $endD = new DateTime($end);
                dump($endD);
                $event
                    ->setTitle($title)
                    ->setDescription($description)
                    ->setStart($startD)
                    ->setEnd($endD)
                    ->setStreamer($user)
                ;
                $em = $this->getDoctrine()->getManager();
                $em->persist($event);
                $em->flush();
                $success=array("success" => true);
                return $this->json($success);
            }else{
                return $this->json(["bdd" => true, "errors" =>$errors]);

            }
        }else{
            return $this->json(["error" => false]);    
            
        }
    }

    /**
     * @Route("/mise-a-jour-deplacement/", name="updateDrop")
    */
    public function updateDrop(Request $request){
        if($request->isMethod("POST")){
            $publicId= $request->request->get('publicId');
            $start= new DateTime($request->request->get('start'));
            $end= new DateTime($request->request->get('end'));
            $er= $this->getDoctrine()->getRepository(Event::class);
            $event = $er->findOneById($publicId);
            dump($event);
            $event->setStart($start)->setEnd($end);

            $em= $this->getDoctrine()->getManager();
            $em->flush();
            

        return $this->json(["success" => true]);
        }else{
            return $this->json(['error' =>true]);
        }
    }
    /**
     * @Route("/mise-a-jour-resize/", name="updateResize")
    */
    public function updateResize(Request $request){
        if($request->isMethod("POST")){
            //récupréation des données envoyé par la requête AJAX
            $publicId = $request->request->get('publicId');
            $end = new DateTime($request->request->get('end'));
            //appel de l'objet event coorespondant à la modification
            $er= $this->getDoctrine()->getRepository(Event::class);
            $event = $er->findOneById($publicId);
            //hydratation de la nouvelle fin de l'évênement
            $event->setEnd($end);
            //appel du manager et enregistrement en bdd
            $em= $this->getDoctrine()->getManager();
            $em->flush();
            //renvoi du message de succès en JSON
            return $this->json(["success" => true]);
        }else{
            return $this->json(["success" => false]);
        }
    }

    /**
     * @Route("supprimer-un-evenement/", name="delete")
     */
    public function delete(Request $request){
        if($request->isMethod("POST")){
            //récupréation des données envoyé par la requête AJAX
            $publicId = $request->request->get('publicId');
        }
    }

    /**
     * @Route("mon-calendrier-viewer", name="viewerCalendar")
     */
    public function viewerCalendar(){
        return $this->render('viewerCalendar.html.twig');
    }
}