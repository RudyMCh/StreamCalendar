<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ActivityRepository")
 */
class Activity
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="integer")
     */
    private $twitch_code;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $gameImage;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getTwitchCode(): ?int
    {
        return $this->twitch_code;
    }

    public function setTwitchCode(int $twitch_code): self
    {
        $this->twitch_code = $twitch_code;

        return $this;
    }

    public function getGameImage(): ?string
    {
        return $this->gameImage;
    }

    public function setGameImage(?string $gameImage): self
    {
        $this->gameImage = $gameImage;

        return $this;
    }
}
